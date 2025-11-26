const express = require('express');
const router = express.Router();
const Break = require('../models/Break');

// GET /api/stats - Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    const [statusStats, typeStats, severityStats, totalOpen, totalHighSeverity, resolvedToday] = await Promise.all([
      // Group by Status
      Break.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Group by Type
      Break.aggregate([
        { $group: { _id: '$breakType', count: { $sum: 1 } } }
      ]),
      // Group by Severity
      Break.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      // Total Open
      Break.countDocuments({ status: 'OPEN' }),
      // Total High Severity
      Break.countDocuments({ severity: 'HIGH' }),
      // Resolved Today
      Break.countDocuments({ 
        status: { $ne: 'OPEN' },
        updatedAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    res.json({
      status: statusStats.map(s => ({ name: s._id, value: s.count })),
      type: typeStats.map(s => ({ name: s._id, value: s.count })),
      severity: severityStats.map(s => ({ name: s._id, value: s.count })),
      summary: {
        totalOpen,
        totalHighSeverity,
        resolvedToday
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
