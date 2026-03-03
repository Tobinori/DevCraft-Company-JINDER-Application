/**
 * Database Configuration for JINDER Application
 * 
 * This file sets up the MongoDB connection using Mongoose ODM (Object Document Mapper).
 * Mongoose provides a straight-forward, schema-based solution to model application data
 * and includes built-in type casting, validation, query building, and business logic hooks.
 */

const mongoose = require('mongoose');
const chalk = require('chalk'); // For colored console output (optional dependency)

/**
 * Database Configuration Class
 * 
 * This class encapsulates all database-related functionality including:
 * - Connection establishment
 * - Event handling
 * - Error management
 * - Graceful shutdown
 */
class DatabaseConfig {
  constructor() {
    // MongoDB connection instance
    this.connection = null;
    
    // Connection options for optimization and reliability
    this.connectionOptions = {
      // Use new URL string parser (removes deprecation warnings)
      useNewUrlParser: true,
      
      // Use new Server Discovery and Monitoring engine
      useUnifiedTopology: true,
      
      // Maximum number of connections in the connection pool
      maxPoolSize: 10,
      
      // Close connections after 30 seconds of inactivity
      maxIdleTimeMS: 30000,
      
      // How long to wait for a connection to be established
      serverSelectionTimeoutMS: 5000,
      
      // How long a generated ObjectId should be unique for
      bufferMaxEntries: 0,
      
      // Number of times to retry failed operations
      retryWrites: true,
      
      // Read from primary by default
      readPreference: 'primary'
    };
  }

  /**
   * Get MongoDB connection string from environment variables
   * 
   * Priority order:
   * 1. MONGODB_URI (for production/deployment platforms like Heroku)
   * 2. DATABASE_URL (alternative environment variable)
   * 3. Constructed from individual components
   * 4. Default local development connection
   * 
   * @returns {string} MongoDB connection string
   */
  getConnectionString() {
    // Check for full connection string first (most common in production)
    if (process.env.MONGODB_URI) {
      return process.env.MONGODB_URI;
    }
    
    if (process.env.DATABASE_URL) {
      return process.env.DATABASE_URL;
    }
    
    // Construct connection string from individual components
    const {
      DB_HOST = 'localhost',
      DB_PORT = '27017',
      DB_NAME = 'jinder_dev',
      DB_USER,
      DB_PASSWORD
    } = process.env;
    
    // Build connection string based on whether authentication is required
    if (DB_USER && DB_PASSWORD) {
      return `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    }
    
    // Default local development connection (no authentication)
    return `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  }

  /**
   * Set up connection event listeners
   * 
   * Mongoose connection events help monitor the state of the database connection
   * and provide feedback for debugging and monitoring purposes.
   */
  setupConnectionEvents() {
    const db = mongoose.connection;
    
    // Connection successful
    db.on('connected', () => {
      console.log(chalk?.green('✅ MongoDB connected successfully'));
      console.log(`📊 Database: ${db.name}`);
      console.log(`🌐 Host: ${db.host}:${db.port}`);
    });
    
    // Connection error
    db.on('error', (error) => {
      console.error(chalk?.red('❌ MongoDB connection error:'));
      console.error(error);
      
      // In production, you might want to implement retry logic here
      // or send alerts to monitoring services
    });
    
    // Connection disconnected
    db.on('disconnected', () => {
      console.log(chalk?.yellow('⚠️ MongoDB disconnected'));
    });
    
    // Connection reconnected
    db.on('reconnected', () => {
      console.log(chalk?.green('🔄 MongoDB reconnected'));
    });
    
    // Connection ready (after initial connection and authentication)
    db.once('open', () => {
      console.log(chalk?.blue('🚀 Database connection is ready'));
    });
    
    // Buffer overflow (when operation buffer is full)
    db.on('fullsetup', () => {
      console.log(chalk?.cyan('📡 MongoDB replica set connected'));
    });
  }

  /**
   * Connect to MongoDB database
   * 
   * This method establishes the connection to MongoDB using Mongoose.
   * It includes error handling and connection event setup.
   * 
   * @returns {Promise<void>} Promise that resolves when connection is established
   */
  async connect() {
    try {
      console.log('🔌 Attempting to connect to MongoDB...');
      
      // Get connection string
      const connectionString = this.getConnectionString();
      
      // Log connection attempt (hide credentials for security)
      const safeConnectionString = connectionString.replace(
        /\/\/([^:]+):([^@]+)@/,
        '//***:***@'
      );
      console.log(`🎯 Connection string: ${safeConnectionString}`);
      
      // Set up event listeners before connecting
      this.setupConnectionEvents();
      
      // Establish connection
      this.connection = await mongoose.connect(
        connectionString,
        this.connectionOptions
      );
      
      return this.connection;
      
    } catch (error) {
      console.error(chalk?.red('💥 Failed to connect to MongoDB:'));
      console.error(error.message);
      
      // Provide helpful error messages for common issues
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n🔧 Troubleshooting tips:');
        console.error('1. Make sure MongoDB is running on your system');
        console.error('2. Check if the connection string is correct');
        console.error('3. Verify firewall settings');
      } else if (error.message.includes('Authentication failed')) {
        console.error('\n🔐 Authentication issue:');
        console.error('1. Check your username and password');
        console.error('2. Verify the database name');
        console.error('3. Ensure the user has proper permissions');
      }
      
      // Re-throw error to be handled by the caller
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB database
   * 
   * This method gracefully closes the database connection.
   * It's important to call this when the application shuts down
   * to prevent connection leaks.
   * 
   * @returns {Promise<void>} Promise that resolves when disconnection is complete
   */
  async disconnect() {
    try {
      if (this.connection) {
        console.log('🔌 Closing database connection...');
        await mongoose.connection.close();
        console.log(chalk?.green('✅ Database connection closed successfully'));
      }
    } catch (error) {
      console.error(chalk?.red('❌ Error closing database connection:'));
      console.error(error);
      throw error;
    }
  }

  /**
   * Get current connection status
   * 
   * Mongoose connection states:
   * 0 = disconnected
   * 1 = connected
   * 2 = connecting
   * 3 = disconnecting
   * 
   * @returns {string} Current connection status
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
   * Set up graceful shutdown handlers
   * 
   * This ensures the database connection is properly closed when the application
   * receives termination signals (SIGINT, SIGTERM, etc.)
   */
  setupGracefulShutdown() {
    // Handle different termination signals
    const shutdownSignals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    
    shutdownSignals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
        
        try {
          await this.disconnect();
          console.log('👋 Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('💥 Uncaught Exception:', error);
      try {
        await this.disconnect();
      } catch (disconnectError) {
        console.error('❌ Error disconnecting:', disconnectError);
      }
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('🚫 Unhandled Rejection at:', promise, 'reason:', reason);
      try {
        await this.disconnect();
      } catch (disconnectError) {
        console.error('❌ Error disconnecting:', disconnectError);
      }
      process.exit(1);
    });
  }
}

// Create and export a singleton instance
const databaseConfig = new DatabaseConfig();

/**
 * Initialize database connection with graceful shutdown
 * 
 * This is the main function to call when starting your application.
 * It connects to the database and sets up graceful shutdown handlers.
 * 
 * @returns {Promise<mongoose.Connection>} The established database connection
 */
const initializeDatabase = async () => {
  try {
    // Set up graceful shutdown before connecting
    databaseConfig.setupGracefulShutdown();
    
    // Connect to database
    const connection = await databaseConfig.connect();
    
    // Optional: Set global Mongoose options
    mongoose.set('strictQuery', true); // Prepare for Mongoose 7
    
    return connection;
    
  } catch (error) {
    console.error('🚨 Database initialization failed:', error.message);
    process.exit(1);
  }
};

// Export both the class instance and the initialization function
module.exports = {
  databaseConfig,
  initializeDatabase,
  
  // Convenience exports for direct access
  connect: () => databaseConfig.connect(),
  disconnect: () => databaseConfig.disconnect(),
  getStatus: () => databaseConfig.getConnectionStatus(),
  
  // Export mongoose for model definitions
  mongoose
};

/**
 * Usage Examples:
 * 
 * // In your main app.js or server.js:
 * const { initializeDatabase } = require('./config/database');
 * 
 * async function startServer() {
 *   try {
 *     // Initialize database connection
 *     await initializeDatabase();
 *     
 *     // Start your Express server after database is connected
 *     app.listen(PORT, () => {
 *       console.log(`Server running on port ${PORT}`);
 *     });
 *   } catch (error) {
 *     console.error('Failed to start server:', error);
 *     process.exit(1);
 *   }
 * }
 * 
 * startServer();
 * 
 * // For manual connection management:
 * const { databaseConfig } = require('./config/database');
 * 
 * async function customConnection() {
 *   await databaseConfig.connect();
 *   console.log('Status:', databaseConfig.getConnectionStatus());
 *   await databaseConfig.disconnect();
 * }
 */