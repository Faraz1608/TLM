const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  breakType: { type: String, enum: ['CASH', 'STOCK'], required: true },
  expectedTradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradeExpected' },
  actualSettlementId: { type: mongoose.Schema.Types.ObjectId, ref: 'SettlementActual' },
  expectedValue: { type: mongoose.Decimal128 },
  actualValue: { type: mongoose.Decimal128 },
  difference: { type: mongoose.Decimal128 },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
  reason: { type: String },
  status: { type: String, enum: ['OPEN', 'ASSIGNED', 'RESOLVED'], default: 'OPEN' },
  assignedTo: { type: String },
  fingerprint: { type: String, required: true, index: true }, // For dedup
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Break', breakSchema);
