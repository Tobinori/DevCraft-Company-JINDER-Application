const mongoose = require('mongoose');
const colors = require('colors');

// MongoDB connection configuration
const connectDB = async () => {
  try {
    // Connection options for production readiness
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      },
      readPreference: 'primary',
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
      bufferMaxEntries: 0
    };

    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/jinder';

    if (!mongoURI) {
      throw new Error('MongoDB connection string not provided in environment variables');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    // Connection success logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`.cyan.underline.bold);
      console.log(`📊 Database: ${conn.connection.name}`.green);
      console.log(`🔗 Connection State: ${getConnectionState(conn.connection.readyState)}`.blue);
    } else {
      console.log('MongoDB Connected Successfully');
    }

    // Set up connection event listeners
    setupConnectionListeners();

    return conn;

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`.red.bold);
    
    // Log additional error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', error);
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

// Set up connection event listeners for monitoring
const setupConnectionListeners = () => {
  const db = mongoose.connection;

  // Connection opened
  db.on('connected', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Mongoose connected to MongoDB'.green);
    }
  });

  // Connection error
  db.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err}`.red);
  });

  // Connection disconnected
  db.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from MongoDB'.yellow);
  });

  // Connection reconnected
  db.on('reconnected', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Mongoose reconnected to MongoDB'.cyan);
    }
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', async () => {
    try {
      await db.close();
      console.log('\n🔒 MongoDB connection closed through app termination'.yellow);
      process.exit(0);
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });

  // Handle SIGTERM
  process.on('SIGTERM', async () => {
    try {
      await db.close();
      console.log('🔒 MongoDB connection closed through SIGTERM'.yellow);
      process.exit(0);
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });
};

// Helper function to get readable connection state
const getConnectionState = (state) => {
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  return states[state] || 'Unknown';
};

// Function to check database connection health
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const isConnected = state === 1;
    
    if (isConnected) {
      // Perform a simple ping to verify connection
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        state: getConnectionState(state),
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      };
    } else {
      return {
        status: 'unhealthy',
        state: getConnectionState(state),
        message: 'Database connection is not active'
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
};

// Function to gracefully close database connection
const closeDatabaseConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed successfully'.yellow);
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  checkDatabaseHealth,
  closeDatabaseConnection
};