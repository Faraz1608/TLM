const express = require('express');
const router = express.Router();
const Break = require('../models/Break');
const BreakHistory = require('../models/BreakHistory');
const TradeExpected = require('../models/TradeExpected');
const SettlementActual = require('../models/SettlementActual');

// GET /api/breaks - List breaks with filters
router.get('/', async (req, res) => {
  try {
    const { type, status, severity, account, page = 1, limit = 50 } = req.query;
    const query = {};
    if (type) query.breakType = type;
    if (status) query.status = status;
    if (severity) query.severity = severity;
    // Account filtering would require joining or storing account on Break (for MVP we might skip or do simple lookup)
    // For MVP, let's assume we filter by what's on the Break model or we'd need to aggregate.
    // To keep it simple/fast, we won't filter by account on the Break level unless we denormalize it.
    // But we can filter by ID if provided.

    const breaks = await Break.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('expectedTradeId')
      .populate('actualSettlementId');
      
    const total = await Break.countDocuments(query);

    res.json({ breaks, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/breaks/:id - Detail
router.get('/:id', async (req, res) => {
  try {
    const brk = await Break.findById(req.params.id)
      .populate('expectedTradeId')
      .populate('actualSettlementId');
    
    if (!brk) return res.status(404).json({ error: 'Break not found' });

    const history = await BreakHistory.find({ breakId: brk._id }).sort({ timestamp: 1 });

    res.json({ break: brk, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/breaks/:id/assign
router.post('/:id/assign', async (req, res) => {
  try {
    const { assignee } = req.body;
    const brk = await Break.findByIdAndUpdate(req.params.id, { 
      assignedTo: assignee, 
      status: 'ASSIGNED',
      updatedAt: Date.now()
    }, { new: true });

    await new BreakHistory({
      breakId: brk._id,
      action: 'ASSIGNED',
      user: 'system', // In real app, req.user
      comment: `Assigned to ${assignee}`
    }).save();

    res.json(brk);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/breaks/:id/resolve
router.post('/:id/resolve', async (req, res) => {
  try {
    const { comment, resolutionCode } = req.body;
    const brk = await Break.findByIdAndUpdate(req.params.id, { 
      status: 'RESOLVED',
      updatedAt: Date.now()
    }, { new: true });

    await new BreakHistory({
      breakId: brk._id,
      action: 'RESOLVED',
      user: 'system',
      comment: `${resolutionCode}: ${comment}`
    }).save();

    res.json(brk);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/breaks/:id/comment
router.post('/:id/comment', async (req, res) => {
  try {
    const { comment } = req.body;
    await new BreakHistory({
      breakId: req.params.id,
      action: 'COMMENT',
      user: 'system',
      comment
    }).save();

    res.json({ message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
