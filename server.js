const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'JINDER API is running',
    timestamp: new Date().toISOString()
  });
});

// Test route for demo
app.get('/api/jobs', (req, res) => {
  res.json({
    jobs: [
      {
        id: 1,
        title: 'Frontend Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        description: 'Looking for a skilled frontend developer...',
        requirements: ['React', 'JavaScript', 'CSS'],
        salary: '$80k - $120k'
      },
      {
        id: 2,
        title: 'Backend Engineer',
        company: 'StartupXYZ',
        location: 'Remote',
        description: 'Join our backend team...',
        requirements: ['Node.js', 'MongoDB', 'API Design'],
        salary: '$90k - $130k'
      }
    ]
  });
});

// Catch all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 JINDER server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;