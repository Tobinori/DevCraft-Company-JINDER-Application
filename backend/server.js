// Import required modules
const express = require('express');
const cors = require('cors');

// Create Express application instance
const app = express();

// Define the port number - using 3001 to avoid conflicts with React dev server (3000)
const PORT = process.env.PORT || 3001;

// MIDDLEWARE SETUP
// =================

// CORS (Cross-Origin Resource Sharing) middleware
// This allows our frontend (running on a different port) to make requests to our backend
// Without this, browsers would block requests due to same-origin policy
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow requests from common frontend ports
  credentials: true // Allow cookies and authentication headers
}));

// JSON parsing middleware
// This middleware parses incoming requests with JSON payloads
// It makes the parsed data available in req.body for our route handlers
app.use(express.json({ limit: '10mb' })); // Set a reasonable limit for request size

// URL-encoded data parsing middleware
// This handles form data submissions (application/x-www-form-urlencoded)
// Extended: true allows for rich objects and arrays to be encoded
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for development)
// This logs each incoming request for debugging purposes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next(); // Always call next() to pass control to the next middleware
});

// ROUTES
// ======

// Health check endpoint
// This is a simple endpoint to verify that the server is running
// Commonly used by load balancers, monitoring tools, and for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'JINDER Backend Server is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Welcome endpoint for the root path
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to JINDER Backend API',
    version: '1.0.0',
    documentation: '/api/health for health check'
  });
});

// Catch-all route for undefined endpoints
// This handles any requests to routes that don't exist
// It should be defined after all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /api/health'
    ]
  });
});

// Global error handling middleware
// This catches any errors that occur in our route handlers
// It must be defined after all other middleware and routes
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// START THE SERVER
// ================

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log('🚀 JINDER Backend Server Started!');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});

// Graceful shutdown handling
// This ensures the server shuts down properly when terminated
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Export the app for testing purposes
module.exports = app;