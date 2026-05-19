// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://ghost-collab.vercel.app',
  'https://ghost-collab.tech',
  'https://www.ghost-collab.tech',
  /\.vercel\.app$/,  // Allow all Vercel preview deployments
];

const configuredFrontendOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...defaultAllowedOrigins, ...configuredFrontendOrigins];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});