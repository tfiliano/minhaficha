const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const net = require("net");
const fs = require("fs");
const { spawn } = require("child_process");
const MockPrinterService = require("./mockPrinterService");

// Configuration for test mode
const TEST_MODE = process.env.TEST_MODE === "true";
const mockPrinterService = new MockPrinterService({
  successRate: 0.7, // 70% success for tests
  responseDelay: 1000, // 1000ms delay
  randomFailures: true,
});

// Load environment variables
let config;
try {
  // Em desenvolvimento, busca na raiz do projeto
  if (process.env.NODE_ENV === "development") {
    config = require("../config.json");
  } else {
    // Em produção, busca no diretório de recursos do app
    const configPath = path.join(process.resourcesPath, "config.json");
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch (error) {
  console.error("Erro ao carregar configuração:", error);
  // Mostrar uma janela de erro e fechar o aplicativo
  app.whenReady().then(() => {
    const errorWindow = new BrowserWindow({
      width: 500,
      height: 300,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    errorWindow.loadURL(`data:text/html,
      <html>
        <body>
          <h2>Erro de Configuração</h2>
          <p>Não foi possível carregar as configurações necessárias.</p>
          <p>Erro: ${error.message}</p>
          <p>Verifique se o arquivo config.json existe e contém os dados corretos.</p>
        </body>
      </html>
    `);

    errorWindow.on("closed", () => {
      app.quit();
    });
  });
  return;
}

let pollingTimeout;

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Poll interval for checking print queue (in milliseconds)
const POLL_INTERVAL = config.pollInterval || 5000;

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
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the HTML file
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open DevTools in development mode
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  // Start the print service
  startPrintService();

  // On macOS, re-create window when dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
    }
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log(
    "Outra instância do aplicativo já está em execução. Fechando esta instância."
  );
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
const { Printer } = require("@plantae-tech/inkpresser");
// Function to send ZPL to printer
async function sendToPrinter(print) {

  const { nome, ip, port, zpl, tipo_de_conexao } = print;
  // Use mock printer service in test mode
  if (TEST_MODE) {
    console.log(`[TEST MODE] Sending to mock printer at ${ip}:${port}`);

    if (tipo_de_conexao === "ip") {
      return mockPrinterService.sendToPrinter(ip, port, zpl);
    } else {
     
      const printerr = new Printer({
        name: nome,
      });
      return await printerr.printRaw(Buffer.from(zpl), "teste");
    }


  }

  if(tipo_de_conexao === "name"){
    return new Promise(async(resolve,reject) => {
      try {
        const printerr = new Printer({
          name: nome,
        });
        const result =  await printerr.printRaw(Buffer.from(zpl), "teste");
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let responseData = "";

    client.connect(port, ip, () => {
      console.log(`Connected to printer at ${ip}:${port}`);
      client.write(zpl);
    });

    client.on("data", (data) => {
      responseData += data.toString();
    });

    client.on("close", () => {
      resolve(responseData);
    });

    client.on("error", (error) => {
      reject(error);
    });

    // Set a timeout
    setTimeout(() => {
      client.destroy();
      reject(new Error("Print timeout"));
    }, 10000);
  });
}

// Configuration for print retry
const RETRY_CONFIG = {
  maxRetries: 1,
  initialDelay: 5000, // 5 seconds
  backoffFactor: 2, // Exponential backoff
  maxPrintingState: 300000, // 5 minutes max in printing state
};

// Function to process a single print job with retries
async function processPrintJob(job, attemptNumber = 1) {
  try {

   
    console.log(`Processing job ${job.id} (attempt ${attemptNumber})`);

    // Update status to printing
    await supabase
      .from("etiquetas")
      .update({
        status: "printing",
        processing_started_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    // Get printer details
    if (!job.impressora_id) {
      throw new Error("Nenhuma impressora atribuída ao trabalho");
    }

    const { data: printer, error: printerError } = await supabase
      .from("impressoras")
      .select("*")
      .eq("id", job.impressora_id)
      .single();

    if (printerError)
      throw new Error(`Impressora não encontrada: ${printerError.message}`);

    // Send to printer
    await sendToPrinter({
      nome: printer.nome,
      ip: printer.ip,
      port: printer.porta || 9100,
      zpl: job.command,
      tipo_de_conexao: printer.tipo_de_conexao
    });

    // Update status to completed
    await supabase
      .from("etiquetas")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    console.log(`Job ${job.id} completed successfully`);

    // Notify renderer process about job status change
    if (mainWindow) {
      mainWindow.webContents.send("job-status-update", {
        id: job.id,
        status: "completed",
      });
    }
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);

    // If within retry limit, attempt retry
    if (attemptNumber < RETRY_CONFIG.maxRetries) {
      console.log(
        `Scheduling retry ${attemptNumber + 1} for job ${job.id} in ${RETRY_CONFIG.initialDelay *
        Math.pow(RETRY_CONFIG.backoffFactor, attemptNumber - 1)
        }ms`
      );

      // Add retry information
      await supabase
        .from("etiquetas")
        .update({
          retry_count: attemptNumber,
          last_error: error.message,
          next_retry_at: new Date(
            Date.now() +
            RETRY_CONFIG.initialDelay *
            Math.pow(RETRY_CONFIG.backoffFactor, attemptNumber - 1)
          ).toISOString(),
        })
        .eq("id", job.id);

      // Schedule retry with exponential backoff
      setTimeout(() => {
        processPrintJob(job, attemptNumber + 1);
      }, RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffFactor, attemptNumber - 1));

      return;
    }

    // Update status to failed after all retries
    await supabase
      .from("etiquetas")
      .update({
        status: "failed",
        error_message: `Falha na impressão após ${attemptNumber} tentativas: ${error.message}`,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    // Notify renderer process about job status change
    if (mainWindow) {
      mainWindow.webContents.send("job-status-update", {
        id: job.id,
        status: "failed",
        error: error.message,
      });
    }
  }
}

// Main polling function with enhanced job handling
async function pollPrintQueue() {
  try {
    // Check for stalled "printing" jobs first (jobs that have been in printing state for too long)
    const { data: printingJobs, error: printingError } = await supabase
      .from("etiquetas")
      .select("*")
      .eq("status", "printing")
      .order("created_at");

    if (printingError) throw printingError;

    for (const job of printingJobs || []) {
      // Check if job has been in printing state for too long
      const processingStartedAt = job.processing_started_at
        ? new Date(job.processing_started_at)
        : null;
      const now = new Date();

      // If processing_started_at is missing or too old, mark as failed or retry
      if (
        !processingStartedAt ||
        now - processingStartedAt > RETRY_CONFIG.maxPrintingState
      ) {
        console.log(
          `Job ${job.id} has been in "printing" state for too long, marking as failed`
        );

        // If retry count is available and within limits, retry
        if (job.retry_count < RETRY_CONFIG.maxRetries - 1) {
          console.log(`Requeuing job ${job.id} for retry`);
          await supabase
            .from("etiquetas")
            .update({
              status: "pending",
              retry_count: (job.retry_count || 0) + 1,
              processing_started_at: null,
            })
            .eq("id", job.id);
        } else {
          // Otherwise mark as failed
          await supabase
            .from("etiquetas")
            .update({
              status: "failed",
              error_message: "Tempo limite de impressão excedido",
              completed_at: now.toISOString(),
            })
            .eq("id", job.id);

          // Notify renderer
          if (mainWindow) {
            mainWindow.webContents.send("job-status-update", {
              id: job.id,
              status: "failed",
              error: "Tempo limite de impressão excedido",
            });
          }
        }
      }
    }

    // Get pending print jobs
    const { data: jobs, error } = await supabase
      .from("etiquetas")
      .select("*")
      .eq("status", "pending")
      .order("created_at");

    if (error) throw error;

    // Process each job
    for (const job of jobs) {
      // Process jobs concurrently - no await here
      processPrintJob(job);
    }
  } catch (error) {
    console.error("Error polling print queue:", error);
  }

  // Schedule next poll
  pollingTimeout = setTimeout(pollPrintQueue, POLL_INTERVAL);
}

// Start the print service
function startPrintService() {
  console.log("Print service starting...");
  pollPrintQueue();
}

// Em algum lugar após a criação da janela
function checkForUpdates() {
  // Adicione um hook para verificar e aplicar atualizações
  ipcMain.handle("check-for-updates", async () => {
    // Lógica para verificar se existe nova versão disponível
    return { updateAvailable: false }; // Substitua com sua lógica real
  });

  ipcMain.handle("apply-update", async () => {
    try {
      // Caminho para o instalador da nova versão
      const installerPath = path.join(process.resourcesPath, "update.exe");

      // Executa o instalador silenciosamente e fecha este aplicativo
      spawn(installerPath, ["/S"], {
        detached: true,
        stdio: "ignore",
      });

      // Fecha o aplicativo atual com atraso para permitir o início do instalador
      setTimeout(() => app.quit(), 1000);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

// IPC handlers for renderer process communication
ipcMain.handle("get-printers", async () => {
  try {
    const { data, error } = await supabase
      .from("impressoras")
      .select("*")
      .order("nome");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching printers:", error);
    return { error: error.message };
  }
});

ipcMain.handle("get-print-queue", async () => {
  try {
    const { data, error } = await supabase
      .from("etiquetas")
      .select("*, impressoras(nome)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching print queue:", error);
    return { error: error.message };
  }
});

ipcMain.handle("retry-job", async (event, jobId) => {
  try {
    // Update job status back to pending
    await supabase
      .from("etiquetas")
      .update({
        status: "pending",
      })
      .eq("id", jobId);

    return { success: true };
  } catch (error) {
    console.error("Error retrying job:", error);
    return { error: error.message };
  }
});

// Change printer for a job
ipcMain.handle("change-printer", async (event, { jobId, printerId }) => {
  try {
    // Verify printer exists
    const { data: printer, error: printerError } = await supabase
      .from("impressoras")
      .select("id, nome")
      .eq("id", printerId)
      .single();

    if (printerError)
      throw new Error(`Impressora não encontrada: ${printerError.message}`);

    // Update job with new printer - only update fields we know exist
    const { data: updatedJob, error: updateError } = await supabase
      .from("etiquetas")
      .update({
        impressora_id: printerId,
        status: "pending", // Reset status to pending
      })
      .eq("id", jobId)
      .select("*, impressoras(nome)")
      .single();

    if (updateError) throw updateError;

    return {
      success: true,
      job: updatedJob,
      message: `Impressora alterada para ${printer.nome}`,
    };
  } catch (error) {
    console.error("Error changing printer:", error);
    return { success: false, error: error.message };
  }
});

// Immediate reprocessing of a job
ipcMain.handle("reprocess-job", async (event, jobId) => {
  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("etiquetas")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError)
      throw new Error(`Trabalho não encontrado: ${jobError.message}`);

    // Reset job status and process immediately - only use fields we know exist
    await supabase
      .from("etiquetas")
      .update({
        status: "pending",
      })
      .eq("id", jobId);

    // Process immediately (don't wait for the regular polling)
    processPrintJob(job);

    return { success: true };
  } catch (error) {
    console.error("Error reprocessing job:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("cancel-job", async (event, jobId) => {
  try {
    // Update job status to cancelled
    await supabase
      .from("etiquetas")
      .update({ status: "cancelled" })
      .eq("id", jobId);

    return { success: true };
  } catch (error) {
    console.error("Error cancelling job:", error);
    return { error: error.message };
  }
});

ipcMain.handle("check-printer-status", async (event, { ip, port }) => {
  try {
    const client = new net.Socket();

    return new Promise((resolve) => {
      client.connect(port || 9100, ip, () => {
        client.destroy();
        resolve({ online: true });
      });

      client.on("error", () => {
        resolve({ online: false });
      });

      // Set timeout
      setTimeout(() => {
        client.destroy();
        resolve({ online: false });
      }, 3000);
    });
  } catch (error) {
    console.error("Error checking printer status:", error);
    return { online: false, error: error.message };
  }
});

ipcMain.handle("test-printer", async (event, printerId) => {
  try {
    // Get printer details
    const { data: printer, error: printerError } = await supabase
      .from("impressoras")
      .select("*")
      .eq("id", printerId)
      .single();

    if (printerError)
      throw new Error(`Impressora não encontrada: ${printerError.message}`);

    // Test ZPL command - simple label with text
    const testZpl = `^XA
^FO50,50^ADN,36,20^FDTeste de Impressão^FS
^FO50,100^ADN,36,20^FDImpressora: ${printer.nome}^FS
^FO50,150^ADN,36,20^FDData: ${new Date().toLocaleString("pt-BR")}^FS
^XZ`;

    // Send test command to printer
    const response = await sendToPrinter({
      nome: printer.nome,
      ip: printer.ip,
      port: printer.porta || 9100,
      zpl: testZpl,
      tipo_de_conexao: printer.tipo_de_conexao
    });

    return { success: true, message: "Teste enviado com sucesso!" };
  } catch (error) {
    console.error("Error testing printer:", error);
    return { success: false, error: error.message };
  }
});

// Printer CRUD operations
ipcMain.handle("add-printer", async (event, printerData) => {
  try {

    if (printerData.tipo_de_conexao === "name") {
      // Validate required fields
      if (!printerData.nome) {
        throw new Error("Nome é obrigatório");
      }
    } else {
      // Validate required fields
      if (!printerData.nome || !printerData.ip) {
        throw new Error("Nome e IP são obrigatórios");
      }
    }

    // Add printer to database
    const { data, error } = await supabase
      .from("impressoras")
      .insert([
        {
          nome: printerData.nome,
          ip: printerData.ip,
          porta: printerData.port || 9100,
          created_at: new Date().toISOString(),
          tipo_de_conexao: printerData.tipo_de_conexao || "ip",

        },
      ])
      .select();

    if (error) throw error;

    return { success: true, printer: data[0] };
  } catch (error) {
    console.error("Error adding printer:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("update-printer", async (event, { id, printerData }) => {
  try {
    // Validate required fields
    if (!printerData.nome || !printerData.ip) {
      throw new Error("Nome e IP são obrigatórios");
    }

    // Update printer in database
    const { data, error } = await supabase
      .from("impressoras")
      .update({
        nome: printerData.nome,
        ip: printerData.ip,
        port: printerData.port || 9100,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return { success: true, printer: data[0] };
  } catch (error) {
    console.error("Error updating printer:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("delete-printer", async (event, printerId) => {
  try {
    // Check if printer has associated print jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("etiquetas")
      .select("id")
      .eq("impressora_id", printerId)
      .limit(1);

    if (jobsError) throw jobsError;

    if (jobs && jobs.length > 0) {
      throw new Error(
        "Não é possível excluir uma impressora com trabalhos associados"
      );
    }

    // Delete printer from database
    const { error } = await supabase
      .from("impressoras")
      .delete()
      .eq("id", printerId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting printer:", error);
    return { success: false, error: error.message };
  }
});

// Get job details including ZPL command
ipcMain.handle("get-job-details", async (event, jobId) => {
  try {
    const { data, error } = await supabase
      .from("etiquetas")
      .select("*, impressoras(nome)")
      .eq("id", jobId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching job details:", error);
    return { error: error.message };
  }
});

// Generate ZPL preview using Labelary API
ipcMain.handle("generate-zpl-preview", async (event, zpl) => {
  try {
    const https = require("https");
    const url = "https://api.labelary.com/v1/printers/8dpmm/labels/4x3/0/";

    return new Promise((resolve, reject) => {
      const request = https.request(
        url,
        {
          method: "POST",
          headers: {
            Accept: "image/png",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
        (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP Error: ${response.statusCode}`));
            return;
          }

          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => {
            const buffer = Buffer.concat(chunks);
            const base64Image = buffer.toString("base64");
            resolve({ success: true, imageData: base64Image });
          });
        }
      );

      request.on("error", (error) => {
        reject(error);
      });

      request.write(zpl);
      request.end();
    });
  } catch (error) {
    console.error("Error generating ZPL preview:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-printers-name", async (event) => {
  try {
    const { PrintManager } = require("@plantae-tech/inkpresser");
    const printerManager = new PrintManager();
    const prints = await printerManager.getPrinters();
    return prints;
  } catch (error) {
    console.error("Error fetching printers:", error);
    return { success: false, error: error.message };
  }
});

// Adicione limpeza adequada
app.on("before-quit", () => {
  console.log("Aplicativo sendo encerrado...");
  if (pollingTimeout) {
    console.log("Limpando timer de polling");
    clearTimeout(pollingTimeout);
  }

  // Forçar fechamento de todas as conexões
  if (mainWindow) {
    console.log("Destruindo janela principal");
    mainWindow.destroy();
  }
});


