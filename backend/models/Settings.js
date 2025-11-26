const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  cashTolerance: { type: Number, default: 0.00 },
  dateToleranceDays: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// Singleton-like behavior: we'll mostly use the first document
module.exports = mongoose.model('Settings', settingsSchema);
