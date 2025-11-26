const express = require('express');
const router = express.Router();
const Break = require('../models/Break');

// Get daily stats
router.get('/daily', async (req, res) => {
  try {
    // Aggregate breaks by creation date
    const stats = await Break.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          created: { $sum: 1 },
          resolved: { 
            $sum: { $cond: [{ $ne: ["$status", "OPEN"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Transform for frontend
    const formattedStats = stats.map(s => ({
      date: s._id,
      created: s.created,
      resolved: s.resolved
    }));

    res.json(formattedStats);
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;
