// Import required dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import route handlers
const jobRoutes = require('./routes/jobs');

// Load environment variables from .env file
// This allows us to keep sensitive data like database URLs out of our code
dotenv.config();

// Create Express application instance
// This is the main application object that will handle all HTTP requests
const app = express();

// Set the port from environment variable or default to 5000
// PORT is commonly used in production environments like Heroku
const PORT = process.env.PORT || 5000;

// MongoDB connection string
// In production, this should come from environment variables for security
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jinder';

// ================================
// MIDDLEWARE CONFIGURATION
// ================================

// CORS (Cross-Origin Resource Sharing) middleware
// This allows our frontend (running on a different port) to make requests to our backend
// Without CORS, browsers block requests between different origins for security
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow requests from React app
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers in requests
}));

// Body Parser middleware for JSON requests
// This parses incoming JSON payloads and makes them available in req.body
// limit: '10mb' prevents extremely large payloads that could crash the server
app.use(bodyParser.json({ 
  limit: '10mb',
  type: 'application/json'
}));

// Body Parser middleware for URL-encoded form data
// This handles traditional HTML form submissions
// extended: true allows for rich objects and arrays to be encoded
app.use(bodyParser.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Request logging middleware (custom)
// This logs each incoming request for debugging and monitoring purposes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  // Log request body for POST/PUT requests (be careful with sensitive data)
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  
  next(); // Continue to next middleware
});

// ================================
// DATABASE CONNECTION
// ================================

// Connect to MongoDB using Mongoose
// Mongoose is an ODM (Object Document Mapper) that provides a schema-based solution
async function connectToDatabase() {
  try {
    // Connect with modern connection options
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true, // Use new URL string parser
      useUnifiedTopology: true, // Use new Server Discover and Monitoring engine
    });
    
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    // Exit the process if we can't connect to the database
    process.exit(1);
  }
}

// Initialize database connection
connectToDatabase();

// ================================
// ROUTES CONFIGURATION
// ================================

// Health check endpoint
// This is useful for monitoring services and load balancers
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'JINDER API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API root endpoint
// Provides basic information about the API
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to JINDER API',
    version: '1.0.0',
    endpoints: {
      jobs: '/api/jobs',
      health: '/health'
    },
    documentation: 'Visit /api/docs for API documentation'
  });
});

// Mount job routes at /api/jobs
// All routes defined in the jobs router will be prefixed with /api/jobs
// For example: GET /api/jobs, POST /api/jobs, GET /api/jobs/:id, etc.
app.use('/api/jobs', jobRoutes);

// ================================
// ERROR HANDLING MIDDLEWARE
// ================================

// 404 handler - handles requests to non-existent routes
// This should be placed after all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.method} ${req.originalUrl} does not exist`,
    availableRoutes: [
      'GET /health',
      'GET /api',
      'GET /api/jobs',
      'POST /api/jobs',
      'GET /api/jobs/:id',
      'PUT /api/jobs/:id',
      'DELETE /api/jobs/:id'
    ]
  });
});

// Global error handler
// This catches any errors that occur in our application
// It should be the last middleware in the stack
app.use((error, req, res, next) => {
  console.error('🚨 Server Error:', error);
  
  // Check if it's a MongoDB validation error
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please check your input data',
      details: validationErrors
    });
  }
  
  // Check if it's a MongoDB duplicate key error
  if (error.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Entry',
      message: 'A record with this data already exists'
    });
  }
  
  // Generic server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong on our end' 
      : error.message // Show detailed error only in development
  });
});

// ================================
// SERVER STARTUP
// ================================

// Start the server
// Only start listening after all middleware and routes are configured
app.listen(PORT, () => {
  console.log('🚀 JINDER Backend Server Started');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('===============================================');
  console.log('Available endpoints:');
  console.log(`  • Health Check: http://localhost:${PORT}/health`);
  console.log(`  • API Root: http://localhost:${PORT}/api`);
  console.log(`  • Jobs API: http://localhost:${PORT}/api/jobs`);
  console.log('===============================================');
});

// Graceful shutdown handling
// This ensures the server shuts down cleanly when receiving termination signals
process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM signal. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📊 MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT signal. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📊 MongoDB connection closed');
    process.exit(0);
  });
});

// Export the app for testing purposes
module.exports = app;