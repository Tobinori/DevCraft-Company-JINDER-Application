const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, 'jinder.db');
  }

  // Initialize database connection
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables()
            .then(() => resolve())
            .catch((err) => reject(err));
        }
      });
    });
  }

  // Initialize database tables
  async initializeTables() {
    const createJobsTable = `
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('applied', 'interview', 'rejected', 'offer', 'accepted')),
        dateApplied DATE NOT NULL DEFAULT CURRENT_DATE,
        description TEXT,
        salary REAL,
        location TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.run(createJobsTable, (err) => {
        if (err) {
          console.error('Error creating jobs table:', err.message);
          reject(err);
        } else {
          console.log('Jobs table initialized successfully');
          this.createIndexes()
            .then(() => resolve())
            .catch((err) => reject(err));
        }
      });
    });
  }

  // Create database indexes for better performance
  async createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_dateApplied ON jobs(dateApplied)'
    ];

    const promises = indexes.map(indexQuery => {
      return new Promise((resolve, reject) => {
        this.db.run(indexQuery, (err) => {
          if (err) {
            console.error('Error creating index:', err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    try {
      await Promise.all(promises);
      console.log('Database indexes created successfully');
    } catch (err) {
      throw err;
    }
  }

  // Create a new job entry
  async createJob(jobData) {
    const { title, company, status, dateApplied, description, salary, location } = jobData;
    
    const query = `
      INSERT INTO jobs (title, company, status, dateApplied, description, salary, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(query, [title, company, status, dateApplied, description, salary, location], function(err) {
        if (err) {
          console.error('Error creating job:', err.message);
          reject(err);
        } else {
          console.log(`Job created with ID: ${this.lastID}`);
          resolve({ id: this.lastID, ...jobData });
        }
      });
    });
  }

  // Get all jobs with optional filtering
  async getJobs(filters = {}) {
    let query = 'SELECT * FROM jobs';
    const params = [];
    const conditions = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.company) {
      conditions.push('company LIKE ?');
      params.push(`%${filters.company}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY dateApplied DESC';

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Error fetching jobs:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get a job by ID
  async getJobById(id) {
    const query = 'SELECT * FROM jobs WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.get(query, [id], (err, row) => {
        if (err) {
          console.error('Error fetching job:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Update a job
  async updateJob(id, updates) {
    const allowedFields = ['title', 'company', 'status', 'dateApplied', 'description', 'salary', 'location'];
    const validUpdates = {};
    
    // Filter valid fields
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        validUpdates[key] = updates[key];
      }
    });

    if (Object.keys(validUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const fields = Object.keys(validUpdates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(validUpdates);
    values.push(id);

    const query = `UPDATE jobs SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

    return new Promise((resolve, reject) => {
      this.db.run(query, values, function(err) {
        if (err) {
          console.error('Error updating job:', err.message);
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Job not found'));
        } else {
          console.log(`Job ${id} updated successfully`);
          resolve({ id, ...validUpdates });
        }
      });
    });
  }

  // Delete a job
  async deleteJob(id) {
    const query = 'DELETE FROM jobs WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.run(query, [id], function(err) {
        if (err) {
          console.error('Error deleting job:', err.message);
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Job not found'));
        } else {
          console.log(`Job ${id} deleted successfully`);
          resolve({ deleted: true, id });
        }
      });
    });
  }

  // Get job statistics
  async getJobStats() {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(salary) as avgSalary
      FROM jobs 
      WHERE salary IS NOT NULL
      GROUP BY status
    `;

    return new Promise((resolve, reject) => {
      this.db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error fetching job stats:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Close database connection
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Health check for database
  async healthCheck() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT 1 as test', [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: 'healthy', timestamp: new Date().toISOString() });
        }
      });
    });
  }
}

// Singleton instance
const database = new Database();

module.exports = database;