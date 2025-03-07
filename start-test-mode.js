#!/usr/bin/env node
/**
 * Simple launcher script to start the application in test mode
 * No physical printers are required
 */

// Import required modules
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Determine electron executable path
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');

// Check if electron exists
if (!fs.existsSync(electronPath)) {
  console.error('Electron not found. Please run `npm install` first.');
  process.exit(1);
}

// Set environment variables
const env = {
  ...process.env,
  TEST_MODE: 'true',
  NODE_ENV: 'development'
};

// Launch the application
console.log('Starting print service in TEST MODE...');
console.log('No physical printers required in this mode');
console.log('===========================================');

const electronProcess = spawn(electronPath, ['.'], {
  env,
  stdio: 'inherit'
});

// Handle process events
electronProcess.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
});

electronProcess.on('error', (err) => {
  console.error('Failed to start electron process:', err);
});
