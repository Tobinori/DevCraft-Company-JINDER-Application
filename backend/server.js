/**
 * JINDER Backend Server
 * 
 * This is the main server file for the JINDER application.
 * It sets up an Express.js server with essential middleware and routes.
 * 
 * Learning Notes:
 * - Express.js is a minimal web framework for Node.js
 * - Middleware functions execute during the request-response cycle
 * - Order of middleware matters - they execute in the order they're defined
 */

// Import required dependencies
const express = require('express');
const cors = require('cors');

// Create Express application instance
const app = express();

// Set port from environment variable or default to 3001
const PORT = process.env.PORT || 3001;

/**
 * MIDDLEWARE SETUP
 * Middleware functions are executed sequentially for every request
 */

// 1. CORS (Cross-Origin Resource Sharing) Middleware
// Purpose: Allows frontend applications running on different ports/domains to make requests to this API
// Without CORS, browsers block cross-origin requests for security reasons
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow requests from React dev server
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed request headers
}));

// 2. JSON Body Parser Middleware
// Purpose: Parses incoming JSON payloads in request bodies
// This makes req.body available with parsed JSON data for POST/PUT requests
// Example: When frontend sends {"name": "John"}, req.body.name will be "John"
app.use(express.json({ 
  limit: '10mb' // Limit JSON payload size to prevent abuse
}));

// 3. URL-Encoded Body Parser Middleware
// Purpose: Parses URL-encoded form data (application/x-www-form-urlencoded)
// Useful for traditional HTML form submissions
app.use(express.urlencoded({ 
  extended: true, // Use qs library for rich object parsing
  limit: '10mb' // Limit payload size
}));

// 4. Request Logging Middleware (Custom)
// Purpose: Log all incoming requests for debugging and monitoring
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log request body for non-GET requests (be careful with sensitive data in production)
  if (req.method !== 'GET' && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  next(); // Pass control to the next middleware
});

/**
 * ROUTES DEFINITION
 * Routes define endpoints that clients can make requests to
 */

// Health Check Route
// Purpose: Allows monitoring systems and developers to check if the API is running
// This is a common practice in production applications for load balancers and health checks
app.get('/api/health', (req, res) => {
  // Send a 200 status with JSON response
  res.status(200).json({
    status: 'ok',
    message: 'JINDER API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // Server uptime in seconds
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root Route (Optional)
// Provides basic API information when someone visits the base URL
app.get('/', (req, res) => {
  res.json({
    name: 'JINDER API',
    version: '1.0.0',
    description: 'Backend API for JINDER - A Tinder-like job matching platform',
    endpoints: {
      health: '/api/health',
      // Future endpoints will be documented here
    }
  });
});

/**
 * ERROR HANDLING MIDDLEWARE
 * Must be defined after all routes and other middleware
 */

// 404 Handler - Catches requests to non-existent routes
// This middleware runs when no previous route matches the request
app.use((req, res, next) => {
  const error = {
    status: 404,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  };
  
  console.error('404 Error:', error);
  res.status(404).json(error);
});

// Global Error Handler
// Purpose: Catches all errors that occur during request processing
// Express error handlers must have 4 parameters (err, req, res, next)
app.use((err, req, res, next) => {
  // Log the full error for debugging
  console.error('Global Error Handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Determine error status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Create error response
  const errorResponse = {
    status: 'error',
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  };
  
  // In development, include stack trace for debugging
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }
  
  res.status(statusCode).json(errorResponse);
});

/**
 * SERVER STARTUP
 * Start the Express server and listen for incoming requests
 */

// Graceful shutdown handler
// Purpose: Properly close server connections when the process is terminated
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 JINDER API Server Started Successfully!');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(50));
  
  // Test the health endpoint on startup
  console.log('\n🔍 Testing health endpoint...');
});

// Handle server startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please choose a different port.`);
  } else {
    console.error('❌ Server startup error:', err.message);
  }
  process.exit(1);
});

// Export the app for testing purposes
module.exports = app;