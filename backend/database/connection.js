// backend/database/connection.js
// SQLite Database Connection and Setup for JINDER Job Tracking App

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * DATABASE CONNECTION CONCEPTS:
 * 
 * 1. SQLite is a lightweight, file-based database that doesn't require a separate server
 * 2. Perfect for development and small to medium applications
 * 3. Data is stored in a single file on disk
 * 4. ACID compliant (Atomicity, Consistency, Isolation, Durability)
 */

// Define database file path
const dbPath = path.join(__dirname, 'jinder.db');

/**
 * Create and configure database connection
 * sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE means:
 * - Open database for reading and writing
 * - Create the database file if it doesn't exist
 */
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database at:', dbPath);
});

/**
 * FOREIGN KEY SUPPORT:
 * SQLite has foreign key support disabled by default
 * We enable it to maintain referential integrity
 */
db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
        console.error('❌ Error enabling foreign keys:', err.message);
    } else {
        console.log('✅ Foreign key constraints enabled');
    }
});

/**
 * TABLE STRUCTURE EXPLANATION:
 * 
 * PRIMARY KEY: Unique identifier for each record
 * - INTEGER PRIMARY KEY AUTOINCREMENT creates auto-incrementing IDs
 * 
 * DATA TYPES in SQLite:
 * - INTEGER: Whole numbers
 * - TEXT: String data (VARCHAR equivalent)
 * - REAL: Floating point numbers
 * - BLOB: Binary data
 * - NULL: Missing value
 * 
 * CONSTRAINTS:
 * - NOT NULL: Field cannot be empty
 * - UNIQUE: No duplicate values allowed
 * - DEFAULT: Sets default value if none provided
 * - CHECK: Validates data meets certain conditions
 */

/**
 * Create jobs table with comprehensive structure
 * This table stores all job application information
 */
const createJobsTable = `
    CREATE TABLE IF NOT EXISTS jobs (
        -- Primary key: Unique identifier for each job application
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        
        -- Job basic information
        title TEXT NOT NULL,                    -- Job title (e.g., "Frontend Developer")
        company TEXT NOT NULL,                  -- Company name (e.g., "Google")
        
        -- Application status tracking
        status TEXT NOT NULL DEFAULT 'applied' CHECK (
            status IN ('applied', 'interview', 'offer', 'rejected', 'withdrawn')
        ),                                      -- Current application status
        
        -- Detailed job information
        description TEXT,                       -- Job description and requirements
        
        -- Date tracking
        application_date DATE,                  -- When application was submitted
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Record creation time
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- Last update time
    )
`;

/**
 * Create trigger to automatically update 'updated_at' timestamp
 * This ensures we always know when a record was last modified
 */
const createUpdateTrigger = `
    CREATE TRIGGER IF NOT EXISTS update_jobs_timestamp 
    AFTER UPDATE ON jobs
    FOR EACH ROW
    BEGIN
        UPDATE jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
`;

/**
 * Initialize database tables and triggers
 * This function runs when the application starts
 */
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Begin transaction for atomic operation
        db.serialize(() => {
            console.log('🔧 Initializing database schema...');
            
            // Create jobs table
            db.run(createJobsTable, (err) => {
                if (err) {
                    console.error('❌ Error creating jobs table:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Jobs table created/verified');
            });
            
            // Create update trigger
            db.run(createUpdateTrigger, (err) => {
                if (err) {
                    console.error('❌ Error creating update trigger:', err.message);
                    reject(err);
                    return;
                }
                console.log('✅ Update trigger created/verified');
            });
            
            // Create indexes for better performance
            db.run('CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)', (err) => {
                if (err) {
                    console.error('❌ Error creating status index:', err.message);
                } else {
                    console.log('✅ Status index created/verified');
                }
            });
            
            db.run('CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company)', (err) => {
                if (err) {
                    console.error('❌ Error creating company index:', err.message);
                } else {
                    console.log('✅ Company index created/verified');
                }
                
                console.log('🎉 Database initialization complete!');
                resolve();
            });
        });
    });
}

/**
 * UTILITY FUNCTIONS FOR DATABASE OPERATIONS
 */

/**
 * Run a query and return a promise
 * Useful for INSERT, UPDATE, DELETE operations
 */
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

/**
 * Get a single row from database
 * Useful for SELECT operations that return one result
 */
function getOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Get multiple rows from database
 * Useful for SELECT operations that return multiple results
 */
function getAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Close database connection gracefully
 * Should be called when application shuts down
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
                reject(err);
            } else {
                console.log('✅ Database connection closed');
                resolve();
            }
        });
    });
}

/**
 * Handle graceful shutdown
 * Ensures database connection is properly closed
 */
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT. Closing database connection...');
    try {
        await closeDatabase();
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

// Export database instance and utility functions
module.exports = {
    db,                 // Raw SQLite database instance
    initializeDatabase, // Initialize tables and schema
    runQuery,          // Execute INSERT/UPDATE/DELETE queries
    getOne,            // Get single row
    getAll,            // Get multiple rows
    closeDatabase      // Close database connection
};

/**
 * USAGE EXAMPLES:
 * 
 * // Initialize database when app starts
 * const { initializeDatabase, runQuery, getAll } = require('./database/connection');
 * 
 * // Initialize tables
 * await initializeDatabase();
 * 
 * // Insert a new job
 * const result = await runQuery(
 *     'INSERT INTO jobs (title, company, status, description) VALUES (?, ?, ?, ?)',
 *     ['Software Engineer', 'Tech Corp', 'applied', 'Full-stack development role']
 * );
 * 
 * // Get all jobs
 * const jobs = await getAll('SELECT * FROM jobs ORDER BY created_at DESC');
 * 
 * // Get jobs by status
 * const appliedJobs = await getAll('SELECT * FROM jobs WHERE status = ?', ['applied']);
 */