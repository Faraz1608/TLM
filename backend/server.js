require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5001 ;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tlm_simulator';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/breaks', require('./routes/breaks'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/export', require('./routes/export'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState });
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
