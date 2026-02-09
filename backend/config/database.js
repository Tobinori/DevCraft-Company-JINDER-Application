const mongoose = require('mongoose');
const logger = require('../utils/logger'); // Assuming we have a logger utility

/**
 * MongoDB connection configuration
 * Uses Mongoose ODM for database operations
 */
class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB database
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      // Get connection string from environment variable
      const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/jinder';
      
      // Mongoose connection options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(mongoUri, options);
      
      console.log(`✅ MongoDB connected successfully to: ${mongoUri.replace(/\/\/.*@/, '//<credentials>@')}`);
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      // Log full error details if logger is available
      if (logger && logger.error) {
        logger.error('Database connection failed:', error);
      }
      
      // Exit process on connection failure in production
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        console.log('📤 MongoDB disconnected successfully');
        this.isConnected = false;
        this.connection = null;
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Get connection status
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Setup connection event listeners
   */
  setupEventListeners() {
    // Connection successful
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
      this.isConnected = true;
      
      if (logger && logger.info) {
        logger.info('Database connection established');
      }
    });

    // Connection error
    mongoose.connection.on('error', (error) => {
      console.error('🚨 Mongoose connection error:', error.message);
      this.isConnected = false;
      
      if (logger && logger.error) {
        logger.error('Database connection error:', error);
      }
    });

    // Connection disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('📤 Mongoose disconnected from MongoDB');
      this.isConnected = false;
      
      if (logger && logger.warn) {
        logger.warn('Database connection lost');
      }
    });

    // Application termination
    process.on('SIGINT', async () => {
      try {
        await this.disconnect();
        console.log('👋 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error.message);
        process.exit(1);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      console.error('🚨 Unhandled Promise Rejection:', error);
      if (logger && logger.error) {
        logger.error('Unhandled Promise Rejection:', error);
      }
    });
  }

  /**
   * Initialize database connection with event listeners
   * @returns {Promise<void>}
   */
  async initialize() {
    this.setupEventListeners();
    await this.connect();
  }
}

// Create singleton instance
const database = new Database();

// Export both the instance and the class
module.exports = {
  database,
  Database,
  // Helper function for quick connection
  connectDB: () => database.initialize(),
  // Helper function for disconnection
  disconnectDB: () => database.disconnect(),
  // Helper function to check connection status
  isConnected: () => database.getConnectionStatus()
};

// Auto-initialize if this file is run directly
if (require.main === module) {
  database.initialize()
    .then(() => {
      console.log('✅ Database initialized successfully');
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error.message);
      process.exit(1);
    });
}