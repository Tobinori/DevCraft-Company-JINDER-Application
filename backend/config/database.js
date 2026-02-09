const mongoose = require('mongoose');

/**
 * Database configuration and connection setup
 */

// Connection options for better performance and reliability
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
};

/**
 * Connect to MongoDB database
 * @returns {Promise} mongoose connection promise
 */
const connectDatabase = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/jinder';
    
    console.log('Connecting to MongoDB...');
    
    const connection = await mongoose.connect(connectionString, connectionOptions);
    
    console.log(`✅ MongoDB connected successfully to: ${connection.connection.host}`);
    console.log(`📊 Database: ${connection.connection.name}`);
    
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Log additional error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', error);
    }
    
    // Exit process with failure code
    process.exit(1);
  }
};

/**
 * Handle connection events
 */
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('🔴 Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

/**
 * Graceful shutdown handling
 */
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔄 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

/**
 * Get current connection status
 * @returns {string} connection status
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Close database connection
 * @returns {Promise} close connection promise
 */
const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  connectDatabase,
  closeDatabase,
  getConnectionStatus,
  connection: mongoose.connection
};