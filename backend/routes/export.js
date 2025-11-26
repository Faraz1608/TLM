const express = require('express');
const router = express.Router();
const Break = require('../models/Break');

router.get('/breaks', async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.breakType = type;
    if (severity) filter.severity = severity;

    const breaks = await Break.find(filter).populate('expectedTradeId actualSettlementId');

    // Manual CSV construction
    const headers = [
      'Break ID',
      'Type',
      'Status',
      'Severity',
      'Difference',
      'Reason',
      'Trade ID',
      'Account',
      'Instrument',
      'Expected Value',
      'Actual Value',
      'Created At'
    ];

    const rows = breaks.map(b => {
      const tradeId = b.expectedTradeId ? b.expectedTradeId.tradeId : 'N/A';
      const account = b.expectedTradeId ? b.expectedTradeId.account : 'N/A';
      const instrument = b.expectedTradeId ? b.expectedTradeId.instrument : 'N/A';
      
      return [
        b._id,
        b.breakType,
        b.status,
        b.severity,
        b.difference,
        `"${b.reason.replace(/"/g, '""')}"`, // Escape quotes
        tradeId,
        account,
        instrument,
        b.expectedValue,
        b.actualValue || '',
        b.createdAt.toISOString()
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('breaks_export.csv');
    res.send(csvContent);

  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
