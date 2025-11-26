const mongoose = require('mongoose');

const tradeExpectedSchema = new mongoose.Schema({
  sourceFile: { type: String, required: true },
  tradeId: { type: String, required: true, index: true },
  account: { type: String, required: true, index: true },
  instrument: { type: String, required: true },
  isin: { type: String },
  side: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: mongoose.Decimal128, required: true },
  price: { type: mongoose.Decimal128, required: true },
  currency: { type: String, required: true },
  tradeDate: { type: Date, required: true },
  settlementDate: { type: Date, required: true },
  cashAmount: { type: mongoose.Decimal128 },
  fees: { type: mongoose.Decimal128 },
  status: { type: String, default: 'SETTLED' },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for faster lookups if needed, though tradeId should be unique per source ideally
tradeExpectedSchema.index({ account: 1, settlementDate: 1 });

module.exports = mongoose.model('TradeExpected', tradeExpectedSchema);
