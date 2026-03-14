const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express application instance
const app = express();
const PORT = process.env.PORT || 3001;

// CORS Middleware
// Purpose: Enables Cross-Origin Resource Sharing, allowing frontend (different port/domain) to communicate with backend
// Without this, browsers block requests from different origins for security
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow requests from these origins
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed request headers
}));

// Body Parser Middleware
// Purpose: Parses incoming request bodies and makes them available in req.body
// JSON parser - converts JSON payloads to JavaScript objects
app.use(bodyParser.json({
  limit: '10mb' // Limit payload size to prevent memory issues
}));

// URL-encoded parser - handles form data submissions
// Purpose: Parses application/x-www-form-urlencoded data (traditional HTML forms)
app.use(bodyParser.urlencoded({
  extended: true, // Use qs library for parsing (supports nested objects)
  limit: '10mb'
}));

// Request Logging Middleware (for development)
// Purpose: Logs all incoming requests for debugging and monitoring
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next(); // Pass control to next middleware
});

// Basic Routes
// Health check endpoint - useful for monitoring and deployment verification
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'JINDER backend server is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to JINDER API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/*'
    }
  });
});

// API Routes placeholder
// Purpose: All main application routes will be mounted here
app.use('/api', (req, res, next) => {
  // This is where we'll add our main API routes later
  res.status(404).json({
    error: 'API endpoint not implemented yet',
    path: req.path,
    method: req.method
  });
});

// 404 Handler - Catch all unmatched routes
// Purpose: Provides meaningful response for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: ['/', '/health', '/api']
  });
});

// Global Error Handler Middleware
// Purpose: Catches all errors thrown in the application and provides consistent error responses
// This must be defined after all other middleware and routes
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine error status code
  const statusCode = error.statusCode || error.status || 500;
  
  // Prepare error response
  const errorResponse = {
    error: true,
    message: error.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  };

  // Add stack trace in development mode only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = error;
  }

  res.status(statusCode).json(errorResponse);
});

// Graceful Shutdown Handler
// Purpose: Handles shutdown signals to close server gracefully
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// Start Server
// Purpose: Binds the server to the specified port and begins listening for requests
const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 JINDER Backend Server Started');
  console.log('=================================');
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================');
});

// Handle server startup errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('❌ Server startup error:', error.message);
  }
  process.exit(1);
});

module.exports = app;