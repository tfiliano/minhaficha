const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Printer operations
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    checkPrinterStatus: (printer) => ipcRenderer.invoke('check-printer-status', printer),
    testPrinter: (printerId) => ipcRenderer.invoke('test-printer', printerId),
    addPrinter: (printerData) => ipcRenderer.invoke('add-printer', printerData),
    updatePrinter: (id, printerData) => ipcRenderer.invoke('update-printer', { id, printerData }),
    deletePrinter: (printerId) => ipcRenderer.invoke('delete-printer', printerId),
    
    // Print queue operations
    getPrintQueue: () => ipcRenderer.invoke('get-print-queue'),
    getJobDetails: (jobId) => ipcRenderer.invoke('get-job-details', jobId),
    generateZplPreview: (zpl) => ipcRenderer.invoke('generate-zpl-preview', zpl),
    retryJob: (jobId) => ipcRenderer.invoke('retry-job', jobId),
    cancelJob: (jobId) => ipcRenderer.invoke('cancel-job', jobId),
    
    // Event listeners
    onJobStatusUpdate: (callback) => {
      ipcRenderer.on('job-status-update', (_, data) => callback(data));
      
      // Return a function to remove the event listener
      return () => {
        ipcRenderer.removeAllListeners('job-status-update');
      };
    }
  }
);
