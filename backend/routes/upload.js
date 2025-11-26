const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const TradeExpected = require('../models/TradeExpected');
const SettlementActual = require('../models/SettlementActual');
const Upload = require('../models/Upload');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { type } = req.body; // 'EXPECTED' or 'ACTUAL'
  if (!['EXPECTED', 'ACTUAL'].includes(type)) {
    return res.status(400).json({ error: 'Invalid upload type' });
  }

  const results = [];
  const errors = [];
  
  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        // Basic cleaning/mapping could go here
        results.push(data);
      })
      .on('end', async () => {
        try {
          let insertedCount = 0;
          
          if (type === 'EXPECTED') {
            // Map CSV fields to TradeExpected model
            const trades = results.map(row => ({
              sourceFile: req.file.originalname,
              tradeId: row.trade_id || row.TradeId,
              account: row.account || row.Account,
              instrument: row.instrument || row.Instrument,
              isin: row.isin || row.ISIN,
              side: (row.side || row.Side || '').toUpperCase(),
              quantity: row.quantity || row.Quantity,
              price: row.price || row.Price,
              currency: row.currency || row.Currency,
              tradeDate: new Date(row.trade_date || row.TradeDate),
              settlementDate: new Date(row.settlement_date || row.SettlementDate),
              cashAmount: row.cash_amount || row.CashAmount,
              fees: row.fees || row.Fees,
              status: row.status || row.Status || 'SETTLED'
            }));
            
            // Bulk insert
            const docs = await TradeExpected.insertMany(trades, { ordered: false });
            insertedCount = docs.length;
          } else {
            // Map CSV fields to SettlementActual model
            const settlements = results.map(row => ({
              sourceFile: req.file.originalname,
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

          // Create Upload record
          const uploadRecord = new Upload({
            filename: req.file.originalname,
            type,
            rowsProcessed: insertedCount,
            errors
          });
          await uploadRecord.save();

          // Cleanup file
          fs.unlinkSync(req.file.path);

          // Trigger Matcher (Async or Await based on preference, here await for simplicity in MVP)
          const { runMatcher } = require('../services/matcherService');
          const matchResult = await runMatcher();

          res.json({ 
            message: 'Upload processed successfully', 
            rowsProcessed: insertedCount,
            uploadId: uploadRecord._id,
            matchResult
          });

        } catch (err) {
          console.error('Processing error:', err);
          res.status(500).json({ error: 'Error processing data', details: err.message });
        }
      });
  } catch (err) {
    console.error('File error:', err);
    res.status(500).json({ error: 'Error reading file' });
  }
});

module.exports = router;
