const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const net = require('net');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Poll interval for checking print queue (in milliseconds)
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL) || 5000;

// Keep a reference to the main window to prevent garbage collection
let mainWindow;

// Function to create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the HTML file
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  // Start the print service
  startPrintService();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Function to send ZPL to printer
async function sendToPrinter(ip, port, zpl) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let responseData = '';

    client.connect(port, ip, () => {
      console.log(`Connected to printer at ${ip}:${port}`);
      client.write(zpl);
    });

    client.on('data', (data) => {
      responseData += data.toString();
    });

    client.on('close', () => {
      resolve(responseData);
    });

    client.on('error', (error) => {
      reject(error);
    });

    // Set a timeout
    setTimeout(() => {
      client.destroy();
      reject(new Error('Print timeout'));
    }, 10000);
  });
}

// Function to process a single print job
async function processPrintJob(job) {
  try {
    console.log(`Processing job ${job.id}`);

    // Update status to printing
    await supabase
      .from('etiquetas')
      .update({ status: 'printing' })
      .eq('id', job.id);

    // Get printer details
    if (!job.impressora_id) {
      throw new Error('No printer assigned to job');
    }

    const { data: printer, error: printerError } = await supabase
      .from('impressoras')
      .select('*')
      .eq('id', job.impressora_id)
      .single();

    if (printerError) throw new Error(`Printer not found: ${printerError.message}`);

    // Send to printer
    await sendToPrinter(printer.ip, printer.port || 9100, job.command);

    // Update status to completed
    await supabase
      .from('etiquetas')
      .update({ status: 'completed' })
      .eq('id', job.id);

    console.log(`Job ${job.id} completed successfully`);
    
    // Notify renderer process about job status change
    if (mainWindow) {
      mainWindow.webContents.send('job-status-update', {
        id: job.id,
        status: 'completed'
      });
    }
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);

    // Update status to failed
    await supabase
      .from('etiquetas')
      .update({ 
        status: 'failed',
        error_message: error.message
      })
      .eq('id', job.id);
      
    // Notify renderer process about job status change
    if (mainWindow) {
      mainWindow.webContents.send('job-status-update', {
        id: job.id,
        status: 'failed',
        error: error.message
      });
    }
  }
}

// Main polling function
async function pollPrintQueue() {
  try {
    // Get pending print jobs
    const { data: jobs, error } = await supabase
      .from('etiquetas')
      .select('*')
      .eq('status', 'pending')
      .order('created_at');

    if (error) throw error;

    // Process each job
    for (const job of jobs) {
      await processPrintJob(job);
    }
  } catch (error) {
    console.error('Error polling print queue:', error);
  }

  // Schedule next poll
  setTimeout(pollPrintQueue, POLL_INTERVAL);
}

// Start the print service
function startPrintService() {
  console.log('Print service starting...');
  pollPrintQueue();
}

// IPC handlers for renderer process communication
ipcMain.handle('get-printers', async () => {
  try {
    const { data, error } = await supabase
      .from('impressoras')
      .select('*')
      .order('nome');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching printers:', error);
    return { error: error.message };
  }
});

ipcMain.handle('get-print-queue', async () => {
  try {
    const { data, error } = await supabase
      .from('etiquetas')
      .select('*, impressoras(nome)')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching print queue:', error);
    return { error: error.message };
  }
});

ipcMain.handle('retry-job', async (event, jobId) => {
  try {
    // Update job status back to pending
    await supabase
      .from('etiquetas')
      .update({ 
        status: 'pending',
        error_message: null
      })
      .eq('id', jobId);
      
    return { success: true };
  } catch (error) {
    console.error('Error retrying job:', error);
    return { error: error.message };
  }
});

ipcMain.handle('cancel-job', async (event, jobId) => {
  try {
    // Update job status to cancelled
    await supabase
      .from('etiquetas')
      .update({ status: 'cancelled' })
      .eq('id', jobId);
      
    return { success: true };
  } catch (error) {
    console.error('Error cancelling job:', error);
    return { error: error.message };
  }
});

ipcMain.handle('check-printer-status', async (event, { ip, port }) => {
  try {
    const client = new net.Socket();
    
    return new Promise((resolve) => {
      client.connect(port || 9100, ip, () => {
        client.destroy();
        resolve({ online: true });
      });
      
      client.on('error', () => {
        resolve({ online: false });
      });
      
      // Set timeout
      setTimeout(() => {
        client.destroy();
        resolve({ online: false });
      }, 3000);
    });
  } catch (error) {
    console.error('Error checking printer status:', error);
    return { online: false, error: error.message };
  }
});

ipcMain.handle('test-printer', async (event, printerId) => {
  try {
    // Get printer details
    const { data: printer, error: printerError } = await supabase
      .from('impressoras')
      .select('*')
      .eq('id', printerId)
      .single();
      
    if (printerError) throw new Error(`Impressora não encontrada: ${printerError.message}`);
    
    // Test ZPL command - simple label with text
    const testZpl = `^XA
^FO50,50^ADN,36,20^FDTeste de Impressão^FS
^FO50,100^ADN,36,20^FDImpressora: ${printer.nome}^FS
^FO50,150^ADN,36,20^FDData: ${new Date().toLocaleString('pt-BR')}^FS
^XZ`;
    
    // Send test command to printer
    const response = await sendToPrinter(printer.ip, printer.port || 9100, testZpl);
    
    return { success: true, message: 'Teste enviado com sucesso!' };
  } catch (error) {
    console.error('Error testing printer:', error);
    return { success: false, error: error.message };
  }
});

// Printer CRUD operations
ipcMain.handle('add-printer', async (event, printerData) => {
  try {
    // Validate required fields
    if (!printerData.nome || !printerData.ip) {
      throw new Error('Nome e IP são obrigatórios');
    }
    
    // Add printer to database
    const { data, error } = await supabase
      .from('impressoras')
      .insert([{
        nome: printerData.nome,
        ip: printerData.ip,
        port: printerData.port || 9100,
        created_at: new Date().toISOString()
      }])
      .select();
      
    if (error) throw error;
    
    return { success: true, printer: data[0] };
  } catch (error) {
    console.error('Error adding printer:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-printer', async (event, { id, printerData }) => {
  try {
    // Validate required fields
    if (!printerData.nome || !printerData.ip) {
      throw new Error('Nome e IP são obrigatórios');
    }
    
    // Update printer in database
    const { data, error } = await supabase
      .from('impressoras')
      .update({
        nome: printerData.nome,
        ip: printerData.ip,
        port: printerData.port || 9100
      })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    return { success: true, printer: data[0] };
  } catch (error) {
    console.error('Error updating printer:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-printer', async (event, printerId) => {
  try {
    // Check if printer has associated print jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('etiquetas')
      .select('id')
      .eq('impressora_id', printerId)
      .limit(1);
      
    if (jobsError) throw jobsError;
    
    if (jobs && jobs.length > 0) {
      throw new Error('Não é possível excluir uma impressora com trabalhos associados');
    }
    
    // Delete printer from database
    const { error } = await supabase
      .from('impressoras')
      .delete()
      .eq('id', printerId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting printer:', error);
    return { success: false, error: error.message };
  }
});

// Get job details including ZPL command
ipcMain.handle('get-job-details', async (event, jobId) => {
  try {
    const { data, error } = await supabase
      .from('etiquetas')
      .select('*, impressoras(nome)')
      .eq('id', jobId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching job details:', error);
    return { error: error.message };
  }
});

// Generate ZPL preview using Labelary API
ipcMain.handle('generate-zpl-preview', async (event, zpl) => {
  try {
    const https = require('https');
    const url = 'https://api.labelary.com/v1/printers/8dpmm/labels/4x3/0/';
    
    return new Promise((resolve, reject) => {
      const request = https.request(url, {
        method: 'POST',
        headers: {
          'Accept': 'image/png',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP Error: ${response.statusCode}`));
          return;
        }
        
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const base64Image = buffer.toString('base64');
          resolve({ success: true, imageData: base64Image });
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.write(zpl);
      request.end();
    });
  } catch (error) {
    console.error('Error generating ZPL preview:', error);
    return { success: false, error: error.message };
  }
});
