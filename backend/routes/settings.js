const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      settings = new Settings(); // Return defaults
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update settings
router.post('/', async (req, res) => {
  try {
    const { cashTolerance, dateToleranceDays } = req.body;
    const settings = new Settings({
      cashTolerance,
      dateToleranceDays,
      updatedAt: new Date()
    });
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
