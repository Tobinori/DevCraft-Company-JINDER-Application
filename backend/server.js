// Import required modules
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware setup
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'JINDER backend server is running',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection placeholder
// TODO: Implement MongoDB connection
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// Start server
app.listen(PORT, () => {
  console.log(`JINDER backend server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});