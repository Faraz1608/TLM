const mongoose = require('mongoose');

const settlementActualSchema = new mongoose.Schema({
  sourceFile: { type: String, required: true },
  referenceId: { type: String, required: true },
  account: { type: String, required: true, index: true },
  instrument: { type: String, required: true },
  quantity: { type: mongoose.Decimal128, required: true },
  cashAmount: { type: mongoose.Decimal128 },
  settlementDate: { type: Date, required: true },
  currency: { type: String, required: true },
  side: { type: String, enum: ['BUY', 'SELL'] }, // Often useful to have side in actuals too if available
  createdAt: { type: Date, default: Date.now }
});

settlementActualSchema.index({ account: 1, instrument: 1, settlementDate: 1, side: 1 });

module.exports = mongoose.model('SettlementActual', settlementActualSchema);
