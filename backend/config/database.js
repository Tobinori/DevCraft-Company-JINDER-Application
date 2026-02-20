const mongoose = require('mongoose');
require('dotenv').config();

/**
 * MongoDB Database Configuration
 * Establishes connection to MongoDB Atlas or local MongoDB instance
 * Handles connection events and error handling
 */

class DatabaseConfig {
  constructor() {
    this.connectionString = this.buildConnectionString();
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };
  }

  /**
   * Build MongoDB connection string based on environment
   * @returns {string} MongoDB connection URI
   */
  buildConnectionString() {
    const {
      MONGODB_URI,
      MONGODB_HOST = 'localhost',
      MONGODB_PORT = '27017',
      MONGODB_DATABASE = 'jinder_db',
      MONGODB_USERNAME,
      MONGODB_PASSWORD
    } = process.env;

    // Use MONGODB_URI if provided (for MongoDB Atlas or full URI)
    if (MONGODB_URI) {
      return MONGODB_URI;
    }

    // Build connection string for local MongoDB
    if (MONGODB_USERNAME && MONGODB_PASSWORD) {
      return `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
    }

    return `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
  }

  /**
   * Connect to MongoDB database
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      console.log('🔄 Connecting to MongoDB...');
      console.log(`📍 Connection string: ${this.maskConnectionString()}`);
      
      await mongoose.connect(this.connectionString, this.options);
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      console.error('🔍 Connection string:', this.maskConnectionString());
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB database
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
      console.error('❌ MongoDB disconnection error:', error.message);
      throw error;
    }
  }

  /**
   * Mask sensitive information in connection string for logging
   * @returns {string} Masked connection string
   */
  maskConnectionString() {
    return this.connectionString.replace(
      /mongodb:\/\/([^:]+):([^@]+)@/,
      'mongodb://$1:****@'
    );
  }

  /**
   * Get current connection status
   * @returns {string} Connection status
   */
  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }

  /**
   * Setup connection event listeners
   */
  setupEventListeners() {
    // Connection opened
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    // Connection error
    mongoose.connection.on('error', (error) => {
      console.error('🚨 Mongoose connection error:', error);
    });

    // Connection disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
    });

    // Process termination - close connection
    process.on('SIGINT', async () => {
      try {
        await this.disconnect();
        console.log('👋 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });
  }

  /**
   * Test database connection
   * @returns {Promise<boolean>} Connection test result
   */
  async testConnection() {
    try {
      await mongoose.connection.db.admin().ping();
      console.log('🏓 Database ping successful');
      return true;
    } catch (error) {
      console.error('❌ Database ping failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const databaseConfig = new DatabaseConfig();

// Setup event listeners
databaseConfig.setupEventListeners();

/**
 * Initialize database connection
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  await databaseConfig.connect();
};

/**
 * Close database connection
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  await databaseConfig.disconnect();
};

module.exports = {
  connectDB,
  disconnectDB,
  databaseConfig,
  mongoose
};