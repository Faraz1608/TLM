const { spawn } = require('child_process');
const path = require('path');
const TradeExpected = require('../models/TradeExpected');
const SettlementActual = require('../models/SettlementActual');
const Break = require('../models/Break');
const BreakHistory = require('../models/BreakHistory');

const runMatcher = async () => {
  try {
    // Fetch all trades and actuals (for MVP - in prod we'd filter by date/account)
    const trades = await TradeExpected.find({ status: { $ne: 'MATCHED' } }).lean();
    const actuals = await SettlementActual.find({}).lean();

    if (trades.length === 0) return { message: 'No trades to match' };

    // Fetch settings
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne().sort({ updatedAt: -1 }) || {};

    const inputData = JSON.stringify({ trades, actuals, settings });

    const pythonProcess = spawn('python', [path.join(__dirname, '../../matcher/matcher.py')]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    return new Promise((resolve, reject) => {
      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          console.error(`Python matcher failed: ${errorString}`);
          return reject(new Error(`Matcher failed with code ${code}`));
        }

        try {
          const result = JSON.parse(dataString);
          if (result.error) {
            return reject(new Error(result.error));
          }

          const breaks = result.breaks || [];
          let createdBreaks = 0;

          for (const brk of breaks) {
            // Dedup check using fingerprint
            const existing = await Break.findOne({ fingerprint: brk.fingerprint, status: 'OPEN' });
            if (!existing) {
              const newBreak = new Break(brk);
              await newBreak.save();
              
              const history = new BreakHistory({
                breakId: newBreak._id,
                action: 'AUTO_CREATED',
                comment: `Break created: ${brk.reason}`
              });
              await history.save();
              createdBreaks++;
            }
          }

          resolve({ message: 'Matching completed', breaksCreated: createdBreaks });

        } catch (err) {
          reject(new Error(`Failed to parse matcher output: ${err.message}`));
        }
      });
    });

  } catch (err) {
    console.error('Matcher service error:', err);
    throw err;
  }
};

module.exports = { runMatcher };
