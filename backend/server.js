require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'JINDER API is running',
    timestamp: new Date().toISOString()
  });
});

// TODO: Add database connection setup
// TODO: Import and use route handlers
// TODO: Add error handling middleware
// TODO: Add authentication middleware
// TODO: Add logging middleware

// Set port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`JINDER server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});