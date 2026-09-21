const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const discoverRoutes = require('./routes/discover.routes');
const chatRoutes = require('./routes/chat.routes');
const adminRoutes = require('./routes/admin.routes');
const kycRoutes = require('./routes/kyc.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const femaleEarningsRoutes = require('./routes/femaleEarnings.routes');
const adminFemaleEarningsRoutes = require('./routes/adminFemaleEarnings.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:8081','https://connecto-admin-lake.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/female', femaleEarningsRoutes);
app.use('/api/admin', adminFemaleEarningsRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ConnectX API is running', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;
