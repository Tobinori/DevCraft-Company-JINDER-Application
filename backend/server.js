// JINDER Backend Server Setup
// This file sets up the main Express server for our dating app

// Import required dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express application instance
const app = express();

// Define server port - using 3001 for development
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE SETUP =====

// 1. CORS (Cross-Origin Resource Sharing) Configuration
// This allows our frontend (running on different port) to communicate with backend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow requests from these origins
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

// 2. Body Parser Middleware
// These middleware functions parse incoming request bodies

// Parse JSON payloads (for API requests)
app.use(bodyParser.json({
  limit: '10mb' // Limit JSON payload size (important for image uploads)
}));

// Parse URL-encoded data (for form submissions)
app.use(bodyParser.urlencoded({
  extended: true, // Use extended parsing for nested objects
  limit: '10mb' // Limit payload size
}));

// 3. Request Logging Middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ===== ROUTES SETUP =====

// Health check endpoint - useful for testing if server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'JINDER server is running successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Welcome endpoint for testing
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to JINDER API!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users (coming soon)',
      matches: '/api/matches (coming soon)'
    }
  });
});

// TODO: Add more route handlers here as we develop features
// Example: app.use('/api/users', userRoutes);
// Example: app.use('/api/matches', matchRoutes);

// ===== ERROR HANDLING MIDDLEWARE =====

// 404 Handler - This runs when no routes match the request
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error); // Pass error to error handler
});

// Global Error Handler - This catches all errors in the application
app.use((error, req, res, next) => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(isDevelopment && { 
      stack: error.stack,
      details: error 
    })
  });
});

// ===== SERVER STARTUP =====

// Start the server and listen on specified port
app.listen(PORT, () => {
  console.log('\n🚀 JINDER Server Started Successfully!');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('\n📋 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log('\n💡 Tip: Test the server by visiting the health endpoint!\n');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Export app for testing purposes
module.exports = app;