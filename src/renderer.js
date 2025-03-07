// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const refreshPrintersBtn = document.getElementById('refresh-printers');
const refreshQueueBtn = document.getElementById('refresh-queue');

// Printer list elements
const printersLoading = document.getElementById('printers-loading');
const printersError = document.getElementById('printers-error');
const printersTableContainer = document.getElementById('printers-table-container');
const printersTableBody = document.getElementById('printers-table-body');
const printersEmpty = document.getElementById('printers-empty');

// Print queue elements
const queueLoading = document.getElementById('queue-loading');
const queueError = document.getElementById('queue-error');
const queueTableContainer = document.getElementById('queue-table-container');
const queueTableBody = document.getElementById('queue-table-body');
const queueEmpty = document.getElementById('queue-empty');

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.getAttribute('data-tab');
    
    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active content
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabId) {
        content.classList.add('active');
      }
    });
    
    // Load data for the active tab
    if (tabId === 'printers') {
      loadPrinters();
    } else if (tabId === 'queue') {
      loadPrintQueue();
    }
  });
});

// Refresh buttons
refreshPrintersBtn.addEventListener('click', loadPrinters);
refreshQueueBtn.addEventListener('click', loadPrintQueue);

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}

// Modal elements
const printerModal = document.getElementById('printer-modal');
const printerModalTitle = document.getElementById('printer-modal-title');
const printerForm = document.getElementById('printer-form');
const printerId = document.getElementById('printer-id');
const printerName = document.getElementById('printer-name');
const printerIp = document.getElementById('printer-ip');
const printerPort = document.getElementById('printer-port');
const addPrinterBtn = document.getElementById('add-printer-btn');

const deletePrinterModal = document.getElementById('delete-printer-modal');
const deletePrinterId = document.getElementById('delete-printer-id');
const confirmDeletePrinterBtn = document.getElementById('confirm-delete-printer');

const jobDetailsModal = document.getElementById('job-details-modal');
const jobDetailsContent = document.getElementById('job-details-content');

// Close modal buttons
const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');

// Load printers
async function loadPrinters() {
  // Show loading
  printersLoading.style.display = 'flex';
  printersError.style.display = 'none';
  printersTableContainer.style.display = 'none';
  printersEmpty.style.display = 'none';
  
  try {
    // Fetch printers from the main process
    const printers = await window.api.getPrinters();
    
    if (printers.error) {
      throw new Error(printers.error);
    }
    
    // Clear table
    printersTableBody.innerHTML = '';
    
    if (printers.length === 0) {
      // Show empty state
      printersEmpty.style.display = 'block';
    } else {
      // Populate table
      for (const printer of printers) {
        const row = document.createElement('tr');
        
        // Check printer status
        const statusCheck = await window.api.checkPrinterStatus({
          ip: printer.ip,
          port: printer.port || 9100
        });
        
        const isOnline = statusCheck.online;
        
        row.innerHTML = `
          <td>${printer.nome || 'Sem nome'}</td>
          <td>${printer.ip || '-'}</td>
          <td>${printer.port || 9100}</td>
          <td>
            <span class="status ${isOnline ? 'status-online' : 'status-offline'}">
              ${isOnline ? 'Online' : 'Offline'}
            </span>
          </td>
          <td class="actions">
            <button class="btn btn-sm ${isOnline ? 'btn-success' : 'btn-warning'}" onclick="testPrinter('${printer.id}')">
              Testar
            </button>
            <button class="btn btn-sm" onclick="editPrinter('${printer.id}', '${printer.nome}', '${printer.ip}', ${printer.port || 9100})">
              Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="showDeletePrinterModal('${printer.id}')">
              Excluir
            </button>
          </td>
        `;
        
        printersTableBody.appendChild(row);
      }
      
      // Show table
      printersTableContainer.style.display = 'block';
    }
  } catch (error) {
    // Show error
    printersError.textContent = `Erro ao carregar impressoras: ${error.message}`;
    printersError.style.display = 'block';
  } finally {
    // Hide loading
    printersLoading.style.display = 'none';
  }
}

// Load print queue
async function loadPrintQueue() {
  // Show loading
  queueLoading.style.display = 'flex';
  queueError.style.display = 'none';
  queueTableContainer.style.display = 'none';
  queueEmpty.style.display = 'none';
  
  try {
    // Fetch print queue from the main process
    const queue = await window.api.getPrintQueue();
    
    if (queue.error) {
      throw new Error(queue.error);
    }
    
    // Clear table
    queueTableBody.innerHTML = '';
    
    if (queue.length === 0) {
      // Show empty state
      queueEmpty.style.display = 'block';
    } else {
      // Populate table
      for (const job of queue) {
        const row = document.createElement('tr');
        
        // Create actions based on job status
        let actions = `
          <button class="btn btn-sm" onclick="viewJobDetails('${job.id}')">
            Detalhes
          </button>
          <button class="btn btn-sm btn-success" onclick="previewJob('${job.id}')">
            Preview
          </button>
          <button class="btn btn-sm" onclick="showChangePrinterModal('${job.id}')">
            Trocar Impressora
          </button>
        `;
        
        if (job.status === 'pending' || job.status === 'printing') {
          actions += `
            <button class="btn btn-sm btn-danger" onclick="cancelJob('${job.id}')">
              Cancelar
            </button>
          `;
        } else if (job.status === 'failed') {
          actions += `
            <button class="btn btn-sm btn-warning" onclick="retryJob('${job.id}')">
              Tentar Novamente
            </button>
          `;
        } else if (job.status === 'completed' || job.status === 'cancelled') {
          actions += `
            <button class="btn btn-sm" onclick="reprocessJob('${job.id}')">
              Reprocessar
            </button>
          `;
        }
        
        row.innerHTML = `
          <td>${job.id}</td>
          <td>${job.impressoras?.nome || 'Desconhecida'}</td>
          <td>
            <span class="status status-${job.status || 'pending'}">
              ${getStatusText(job.status)}
            </span>
            ${job.error_message ? `<div class="timestamp">${job.error_message}</div>` : ''}
          </td>
          <td>
            <div>${formatDate(job.created_at)}</div>
          </td>
          <td class="actions">
            ${actions}
          </td>
        `;
        
        queueTableBody.appendChild(row);
      }
      
      // Show table
      queueTableContainer.style.display = 'block';
    }
  } catch (error) {
    // Show error
    queueError.textContent = `Erro ao carregar fila de impressão: ${error.message}`;
    queueError.style.display = 'block';
  } finally {
    // Hide loading
    queueLoading.style.display = 'none';
  }
}

// Get status text
function getStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'printing':
      return 'Imprimindo';
    case 'completed':
      return 'Concluído';
    case 'failed':
      return 'Falhou';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconhecido';
  }
}

// Test printer
window.testPrinter = async (printerId) => {
  try {
    const result = await window.api.testPrinter(printerId);
    
    if (result.success) {
      alert(`Teste enviado com sucesso para a impressora!`);
    } else {
      alert(`Erro ao testar impressora: ${result.error}`);
    }
  } catch (error) {
    alert(`Erro ao testar impressora: ${error.message}`);
  }
};

// Retry job
window.retryJob = async (jobId) => {
  try {
    const result = await window.api.retryJob(jobId);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Reload queue
    loadPrintQueue();
  } catch (error) {
    alert(`Erro ao tentar novamente: ${error.message}`);
  }
};

// Cancel job
window.cancelJob = async (jobId) => {
  try {
    const result = await window.api.cancelJob(jobId);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Reload queue
    loadPrintQueue();
  } catch (error) {
    alert(`Erro ao cancelar: ${error.message}`);
  }
};

// Listen for job status updates
const removeJobStatusListener = window.api.onJobStatusUpdate((data) => {
  // Reload queue if it's active
  if (document.getElementById('queue').classList.contains('active')) {
    loadPrintQueue();
  }
});

// Modal functions
function showModal(modal) {
  modal.style.display = 'flex';
}

function hideModal(modal) {
  modal.style.display = 'none';
}

// Close modals when clicking close buttons
closeModalBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    hideModal(modal);
  });
});

// Add printer button click
addPrinterBtn.addEventListener('click', () => {
  // Reset form
  printerForm.reset();
  printerId.value = '';
  printerModalTitle.textContent = 'Adicionar Impressora';
  
  // Show modal
  showModal(printerModal);
});

// Edit printer
window.editPrinter = (id, name, ip, port) => {
  // Set form values
  printerId.value = id;
  printerName.value = name;
  printerIp.value = ip;
  printerPort.value = port;
  
  // Set modal title
  printerModalTitle.textContent = 'Editar Impressora';
  
  // Show modal
  showModal(printerModal);
};

// Show delete printer modal
window.showDeletePrinterModal = (id) => {
  deletePrinterId.value = id;
  showModal(deletePrinterModal);
};

// Printer form submit
printerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = printerId.value;
  const printerData = {
    nome: printerName.value,
    ip: printerIp.value,
    port: parseInt(printerPort.value) || 9100
  };
  
  try {
    let result;
    
    if (id) {
      // Update existing printer
      result = await window.api.updatePrinter(id, printerData);
    } else {
      // Add new printer
      result = await window.api.addPrinter(printerData);
    }
    
    if (result.success) {
      hideModal(printerModal);
      loadPrinters();
    } else {
      alert(`Erro: ${result.error}`);
    }
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
});

// Confirm delete printer
confirmDeletePrinterBtn.addEventListener('click', async () => {
  const id = deletePrinterId.value;
  
  try {
    const result = await window.api.deletePrinter(id);
    
    if (result.success) {
      hideModal(deletePrinterModal);
      loadPrinters();
    } else {
      alert(`Erro: ${result.error}`);
    }
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
});

// View job details
window.viewJobDetails = async (jobId) => {
  try {
    // Show loading
    jobDetailsContent.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span>Carregando detalhes...</span>
      </div>
    `;
    
    showModal(jobDetailsModal);
    
    // Fetch job details
    const job = await window.api.getJobDetails(jobId);
    
    if (job.error) {
      throw new Error(job.error);
    }
    
    // Format job details
    const html = `
      <div class="job-details-section">
        <h3>Informações Gerais</h3>
        <div class="job-details-row">
          <div class="job-details-label">ID:</div>
          <div class="job-details-value">${job.id}</div>
        </div>
        <div class="job-details-row">
          <div class="job-details-label">Impressora:</div>
          <div class="job-details-value">${job.impressoras?.nome || 'Desconhecida'}</div>
        </div>
        <div class="job-details-row">
          <div class="job-details-label">Status:</div>
          <div class="job-details-value">
            <span class="status status-${job.status || 'pending'}">
              ${getStatusText(job.status)}
            </span>
          </div>
        </div>
        <div class="job-details-row">
          <div class="job-details-label">Data de Criação:</div>
          <div class="job-details-value">${formatDate(job.created_at)}</div>
        </div>
        ${job.error_message ? `
          <div class="job-details-row">
            <div class="job-details-label">Erro:</div>
            <div class="job-details-value">${job.error_message}</div>
          </div>
        ` : ''}
      </div>
      
      <div class="job-details-section">
        <h3>Comando ZPL</h3>
        <div class="job-command">${job.command || 'Nenhum comando disponível'}</div>
      </div>
    `;
    
    jobDetailsContent.innerHTML = html;
  } catch (error) {
    jobDetailsContent.innerHTML = `
      <div class="error-message">
        Erro ao carregar detalhes: ${error.message}
      </div>
    `;
  }
};

// Preview modal element
const previewModal = document.getElementById('preview-modal');
const previewContent = document.getElementById('preview-content');

// Preview job
window.previewJob = async (jobId) => {
  try {
    // Show loading
    previewContent.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span>Gerando preview...</span>
      </div>
    `;
    
    showModal(previewModal);
    
    // Fetch job details
    const job = await window.api.getJobDetails(jobId);
    
    if (job.error) {
      throw new Error(job.error);
    }
    
    if (!job.command) {
      throw new Error('Nenhum comando ZPL disponível para este trabalho');
    }
    
    // Generate preview using Labelary API
    const preview = await window.api.generateZplPreview(job.command);
    
    if (!preview.success) {
      throw new Error(preview.error || 'Erro ao gerar preview');
    }
    
    // Create preview HTML
    const html = `
      <div class="job-details-section">
        <h3>Informações da Etiqueta</h3>
        <div class="job-details-row">
          <div class="job-details-label">Impressora:</div>
          <div class="job-details-value">${job.impressoras?.nome || 'Desconhecida'}</div>
        </div>
      </div>
      
      <div class="job-details-section">
        <h3>Preview da Etiqueta</h3>
        <div style="text-align: center; margin: 20px 0;">
          <img src="data:image/png;base64,${preview.imageData}" alt="Preview da etiqueta" style="max-width: 100%; border: 1px solid #ccc;" />
        </div>
      </div>
      
      <div class="job-details-section">
        <h3>Comando ZPL</h3>
        <div class="job-command">${job.command}</div>
      </div>
    `;
    
    // Update content
    previewContent.innerHTML = html;
  } catch (error) {
    previewContent.innerHTML = `
      <div class="error-message">
        Erro ao gerar preview: ${error.message}
      </div>
    `;
  }
};

// Change printer modal elements
const changePrinterModal = document.getElementById('change-printer-modal');
const changePrinterJobId = document.getElementById('change-printer-job-id');
const printerSelectionLoading = document.getElementById('printer-selection-loading');
const printerSelectionError = document.getElementById('printer-selection-error');
const printerSelectionContainer = document.getElementById('printer-selection-container');
const printerSelection = document.getElementById('printer-selection');
const confirmChangePrinterBtn = document.getElementById('confirm-change-printer');

// Show change printer modal
window.showChangePrinterModal = async (jobId) => {
  // Reset modal state
  changePrinterJobId.value = jobId;
  printerSelection.innerHTML = '<option value="" disabled selected>Selecione uma impressora</option>';
  printerSelectionLoading.style.display = 'flex';
  printerSelectionError.style.display = 'none';
  printerSelectionContainer.style.display = 'none';
  
  // Show modal
  showModal(changePrinterModal);
  
  try {
    // Fetch printers
    const printers = await window.api.getPrinters();
    
    if (printers.error) {
      throw new Error(printers.error);
    }
    
    // Get current job details to know current printer
    const job = await window.api.getJobDetails(jobId);
    
    if (job.error) {
      throw new Error(job.error);
    }
    
    // Populate printer selection dropdown
    printers.forEach(printer => {
      const option = document.createElement('option');
      option.value = printer.id;
      option.textContent = printer.nome;
      
      // Mark current printer as selected
      if (printer.id === job.impressora_id) {
        option.selected = true;
      }
      
      printerSelection.appendChild(option);
    });
    
    // Show printer selection
    printerSelectionContainer.style.display = 'block';
  } catch (error) {
    // Show error
    printerSelectionError.textContent = `Erro ao carregar impressoras: ${error.message}`;
    printerSelectionError.style.display = 'block';
  } finally {
    // Hide loading
    printerSelectionLoading.style.display = 'none';
  }
};

// Reprocess job
window.reprocessJob = async (jobId) => {
  try {
    const result = await window.api.reprocessJob(jobId);
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao reprocessar trabalho');
    }
    
    // Reload queue
    loadPrintQueue();
  } catch (error) {
    alert(`Erro ao reprocessar trabalho: ${error.message}`);
  }
};

// Confirm change printer button click
confirmChangePrinterBtn.addEventListener('click', async () => {
  const jobId = changePrinterJobId.value;
  const newPrinterId = printerSelection.value;
  
  if (!newPrinterId) {
    alert('Por favor, selecione uma impressora.');
    return;
  }
  
  try {
    const result = await window.api.changePrinter(jobId, newPrinterId);
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao trocar impressora');
    }
    
    // Hide modal
    hideModal(changePrinterModal);
    
    // Show success message
    alert(result.message || 'Impressora alterada com sucesso!');
    
    // Reload queue
    loadPrintQueue();
  } catch (error) {
    alert(`Erro ao trocar impressora: ${error.message}`);
  }
});

// Initial data load
loadPrinters();

// Clean up event listeners when window is closed
window.addEventListener('beforeunload', () => {
  if (removeJobStatusListener) {
    removeJobStatusListener();
  }
});

// Enable test mode (for development only)
window.enableTestMode = () => {
  localStorage.setItem('testMode', 'true');
  alert('Modo de teste ativado! As impressões serão processadas em um ambiente simulado.');
  location.reload();
};

window.disableTestMode = () => {
  localStorage.removeItem('testMode');
  alert('Modo de teste desativado.');
  location.reload();
};

// Check if test mode is enabled (for development only)
if (localStorage.getItem('testMode') === 'true') {
  console.log('Executando em modo de teste');
  
  // Add test mode indicator
  const testModeIndicator = document.createElement('div');
  testModeIndicator.style.position = 'fixed';
  testModeIndicator.style.bottom = '10px';
  testModeIndicator.style.right = '10px';
  testModeIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
  testModeIndicator.style.color = 'white';
  testModeIndicator.style.padding = '5px 10px';
  testModeIndicator.style.borderRadius = '4px';
  testModeIndicator.style.fontSize = '12px';
  testModeIndicator.textContent = 'MODO DE TESTE';
  
  document.body.appendChild(testModeIndicator);
}
