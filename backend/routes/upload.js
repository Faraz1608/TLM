const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const TradeExpected = require('../models/TradeExpected');
const SettlementActual = require('../models/SettlementActual');
const Upload = require('../models/Upload');
const { runMatcher } = require('../services/matcherService');

const upload = multer({ dest: 'uploads/' });

// Helper function to process and save data (Common for both CSV and Excel)
async function processDataBatch(type, results, file, res) {
  try {
    let insertedCount = 0;

    if (type === 'EXPECTED') {
      // Map fields to TradeExpected model
      const trades = results.map(row => ({
        sourceFile: file.originalname,
        tradeId: row.trade_id || row.TradeId,
        account: row.account || row.Account,
        instrument: row.instrument || row.Instrument,
        isin: row.isin || row.ISIN,
        side: (row.side || row.Side || '').toUpperCase(),
        quantity: row.quantity || row.Quantity,
        price: row.price || row.Price,
        currency: row.currency || row.Currency,
        // Handle diverse date formats (JS Date object or String)
        tradeDate: new Date(row.trade_date || row.TradeDate),
        settlementDate: new Date(row.settlement_date || row.SettlementDate),
        cashAmount: row.cash_amount || row.CashAmount,
        fees: row.fees || row.Fees,
        status: row.status || row.Status || 'SETTLED'
      }));

      // Bulk insert (unordered to allow partial success if needed, though mostly atomic here)
      const docs = await TradeExpected.insertMany(trades, { ordered: false });
      insertedCount = docs.length;

    } else {
      // Map fields to SettlementActual model
      const settlements = results.map(row => ({
        sourceFile: file.originalname,
        referenceId: row.reference_id || row.ReferenceId || row.trade_id, // Fallback
        account: row.account || row.Account,
        instrument: row.instrument || row.Instrument,
        quantity: row.quantity || row.Quantity,
        cashAmount: row.cash_amount || row.CashAmount,
        settlementDate: new Date(row.settlement_date || row.SettlementDate),
        currency: row.currency || row.Currency,
        side: (row.side || row.Side || '').toUpperCase()
      }));

      const docs = await SettlementActual.insertMany(settlements, { ordered: false });
      insertedCount = docs.length;
    }

    // Create Upload record audit trail
    const uploadRecord = new Upload({
      filename: file.originalname,
      type,
      rowsProcessed: insertedCount,
      processingErrors: [] // Changed from 'errors' to avoid Mongoose keyword conflict
    });
    await uploadRecord.save();

    // Cleanup uploaded file from temp folder
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Trigger Matcher immediately
    const matchResult = await runMatcher();

    res.json({
      message: 'Upload processed successfully',
      rowsProcessed: insertedCount,
      uploadId: uploadRecord._id,
      matchResult
    });

  } catch (err) {
    console.error('Processing error:', err);
    // Cleanup file if error occurs
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: 'Error processing data', details: err.message });
  }
}

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { type } = req.body; // 'EXPECTED' or 'ACTUAL'
  if (!['EXPECTED', 'ACTUAL'].includes(type)) {
    // Cleanup if validation fails
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Invalid upload type' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    // --- LOGIC FOR EXCEL FILES (.xlsx, .xls) ---
    if (ext === '.xlsx' || ext === '.xls') {
      const workbook = xlsx.readFile(req.file.path, { cellDates: true }); // cellDates: true ensures dates are parsed correctly
      const sheetName = workbook.SheetNames[0]; // Read first sheet
      const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      await processDataBatch(type, excelData, req.file, res);
    
    // --- LOGIC FOR CSV FILES (.csv) ---
    } else {
      const results = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          processDataBatch(type, results, req.file, res);
        })
        .on('error', (err) => {
          console.error('CSV Stream Error:', err);
          res.status(500).json({ error: 'Error reading CSV file' });
        });
    }

  } catch (err) {
    console.error('File error:', err);
    res.status(500).json({ error: 'Error reading file' });
  }
});

module.exports = router;
