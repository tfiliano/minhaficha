// Mock Printer Service for testing without physical printers
const EventEmitter = require('events');

class MockPrinterService extends EventEmitter {
  constructor(config = {}) {
    super();
    this.printers = new Map();
    this.config = {
      successRate: 0.8, // 80% success by default
      responseDelay: 500, // 500ms by default
      randomFailures: true,
      ...config
    };
  }

  // Register a mock printer
  registerPrinter(id, details) {
    const defaultState = {
      online: true,
      ready: true,
      error: null,
      jobs: [],
      historyJobs: []
    };

    this.printers.set(id, {
      ...defaultState,
      ...details
    });

    return this.printers.get(id);
  }

  // Set printer state
  setPrinterState(id, state) {
    if (!this.printers.has(id)) {
      throw new Error(`Printer ${id} not registered`);
    }

    const printer = this.printers.get(id);
    this.printers.set(id, { ...printer, ...state });

    // Emit state change event
    this.emit('printer-state-changed', { id, state });
    
    return this.printers.get(id);
  }

  // Get printer state
  getPrinterState(id) {
    return this.printers.has(id) ? this.printers.get(id) : null;
  }

  // Check if printer is online
  async checkPrinterStatus(ip, port) {
    // Find printer by IP and port
    const printerId = Array.from(this.printers.keys()).find(id => {
      const printer = this.printers.get(id);
      return printer.ip === ip && printer.port === port;
    });

    // If printer not found, assume it's registered but offline
    if (!printerId && Array.from(this.printers.values()).length > 0) {
      return { online: false };
    }

    // If no printers are registered, randomly determine if online
    if (!printerId) {
      return { online: Math.random() > 0.3 }; // 70% chance it's online
    }

    const printer = this.printers.get(printerId);
    return { online: printer.online };
  }

  // Send ZPL to mock printer
  async sendToPrinter(ip, port, zpl) {
    return new Promise((resolve, reject) => {
      // Find printer by IP and port
      const printerId = Array.from(this.printers.keys()).find(id => {
        const printer = this.printers.get(id);
        return printer.ip === ip && printer.port === port;
      });

      // Simulate delay
      setTimeout(() => {
        // If printer not found, randomly fail/succeed
        if (!printerId) {
          if (Math.random() > this.config.successRate) {
            return reject(new Error('Printer connection failed'));
          }
          return resolve('');
        }

        const printer = this.printers.get(printerId);
        
        // Check if printer is online
        if (!printer.online) {
          return reject(new Error('Printer is offline'));
        }

        // Check if printer is ready
        if (!printer.ready) {
          return reject(new Error('Printer is not ready'));
        }

        // Check if existing error
        if (printer.error) {
          return reject(new Error(printer.error));
        }

        // Random failure if enabled
        if (this.config.randomFailures && Math.random() > this.config.successRate) {
          const errors = [
            'Out of paper',
            'Paper jam',
            'Ribbon error',
            'Print head overheating',
            'Communication error',
            'Memory overflow'
          ];
          const error = errors[Math.floor(Math.random() * errors.length)];
          return reject(new Error(error));
        }

        // Success - add to print job history
        this.printers.get(printerId).historyJobs.push({
          timestamp: new Date(),
          zpl,
          success: true
        });

        resolve('');
      }, this.config.responseDelay);
    });
  }

  // Reset all printers
  resetAll() {
    for (const id of this.printers.keys()) {
      this.setPrinterState(id, {
        online: true,
        ready: true,
        error: null,
        jobs: []
      });
    }
  }
}

module.exports = MockPrinterService;
