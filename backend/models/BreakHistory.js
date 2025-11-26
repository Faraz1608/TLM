const mongoose = require('mongoose');

const breakHistorySchema = new mongoose.Schema({
  breakId: { type: mongoose.Schema.Types.ObjectId, ref: 'Break', required: true },
  action: { type: String, enum: ['AUTO_CREATED', 'ASSIGNED', 'RESOLVED', 'COMMENT'], required: true },
  user: { type: String, default: 'system' },
  comment: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BreakHistory', breakHistorySchema);
