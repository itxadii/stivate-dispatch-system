const path = require('path');
const fs = require('fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { printChallan } = require('./dist-electron/ipc/printer.js');
const { saveSettings, loadSettings } = require('./dist-electron/ipc/settings.js');

async function testChallan() {
  try {
    console.log('Testing Challan generation with custom company address...');

    // Backup current settings
    const current = loadSettings();

    // Set custom company address
    const testAddress = 'Plot No. 99, Phase 2, Chakan MIDC, Pune - 410501\nTel: +91 9123456789 | contact@newcompany.com';
    saveSettings({
      ...current,
      companyName: 'NEW LOGISTICS INDIA PVT LTD',
      address: testAddress,
    });

    const result = await printChallan({
      id: 1,
      dc_no: 'TEST-DC-01',
      vehicle_no: 'MH-12-AB-9999',
      vehicle_size: '32 ft',
      address: 'B-26 JABIL Ranjangaon',
      supplier_name: 'TEST SUPERVISOR',
      total_pallets: 10,
      particular: 'TEST MATERIALS',
      date: new Date().toISOString()
    }, [], 1);

    console.log('SUCCESS! Challan generated at:', result.filePath);

    // Restore original settings
    saveSettings(current);
    console.log('Settings restored.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testChallan();
