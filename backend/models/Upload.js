const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  uploader: { type: String, default: 'system' },
  rowsProcessed: { type: Number, default: 0 },
  processingErrors: { type: Array, default: [] }, // <--- Renamed
  hash: { type: String },
  type: { type: String, enum: ['EXPECTED', 'ACTUAL'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Upload', uploadSchema);
