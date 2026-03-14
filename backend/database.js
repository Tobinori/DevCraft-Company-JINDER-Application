const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'jinder.db');

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  // Create jobs table
  const createJobsTable = `
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      position TEXT NOT NULL,
      applicationDate DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'applied',
      salaryRange TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createJobsTable, (err) => {
    if (err) {
      console.error('Error creating jobs table:', err.message);
    } else {
      console.log('Jobs table created successfully');
      seedSampleData();
    }
  });
}

// Seed sample data
function seedSampleData() {
  // Check if data already exists
  db.get('SELECT COUNT(*) as count FROM jobs', (err, row) => {
    if (err) {
      console.error('Error checking existing data:', err.message);
      return;
    }

    if (row.count === 0) {
      console.log('Seeding sample data...');
      
      const sampleJobs = [
        {
          company: 'Google',
          position: 'Senior Software Engineer',
          applicationDate: '2024-01-15',
          status: 'interview',
          salaryRange: '$150k - $200k',
          notes: 'Great team culture, exciting AI projects. Technical interview scheduled for next week.'
        },
        {
          company: 'Meta',
          position: 'Full Stack Developer',
          applicationDate: '2024-01-10',
          status: 'applied',
          salaryRange: '$140k - $180k',
          notes: 'Applied through referral. Focus on React and Node.js development.'
        },
        {
          company: 'Netflix',
          position: 'Backend Engineer',
          applicationDate: '2024-01-08',
          status: 'rejected',
          salaryRange: '$130k - $170k',
          notes: 'Unfortunately did not move forward after phone screening. Great learning experience.'
        },
        {
          company: 'Stripe',
          position: 'Software Engineer - Payments',
          applicationDate: '2024-01-20',
          status: 'offer',
          salaryRange: '$160k - $220k',
          notes: 'Received offer! Exciting fintech opportunity with competitive package. Decision deadline is Feb 1st.'
        },
        {
          company: 'Airbnb',
          position: 'Frontend Engineer',
          applicationDate: '2024-01-12',
          status: 'interview',
          salaryRange: '$135k - $175k',
          notes: 'Second round interview completed. Focus on React, TypeScript, and user experience.'
        },
        {
          company: 'Spotify',
          position: 'DevOps Engineer',
          applicationDate: '2024-01-18',
          status: 'applied',
          salaryRange: '$125k - $165k',
          notes: 'Music streaming infrastructure role. Emphasis on Kubernetes and microservices.'
        }
      ];

      const insertStmt = db.prepare(`
        INSERT INTO jobs (company, position, applicationDate, status, salaryRange, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      sampleJobs.forEach((job) => {
        insertStmt.run(
          job.company,
          job.position,
          job.applicationDate,
          job.status,
          job.salaryRange,
          job.notes
        );
      });

      insertStmt.finalize((err) => {
        if (err) {
          console.error('Error seeding data:', err.message);
        } else {
          console.log('Sample data seeded successfully');
        }
      });
    } else {
      console.log('Database already contains data, skipping seed');
    }
  });
}

// Database helper functions
const dbHelpers = {
  // Get all jobs
  getAllJobs: (callback) => {
    db.all('SELECT * FROM jobs ORDER BY createdAt DESC', callback);
  },

  // Get job by ID
  getJobById: (id, callback) => {
    db.get('SELECT * FROM jobs WHERE id = ?', [id], callback);
  },

  // Create new job
  createJob: (jobData, callback) => {
    const { company, position, applicationDate, status, salaryRange, notes } = jobData;
    const stmt = `
      INSERT INTO jobs (company, position, applicationDate, status, salaryRange, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(stmt, [company, position, applicationDate, status, salaryRange, notes], function(err) {
      callback(err, this.lastID);
    });
  },

  // Update job
  updateJob: (id, jobData, callback) => {
    const { company, position, applicationDate, status, salaryRange, notes } = jobData;
    const stmt = `
      UPDATE jobs 
      SET company = ?, position = ?, applicationDate = ?, status = ?, 
          salaryRange = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    db.run(stmt, [company, position, applicationDate, status, salaryRange, notes, id], callback);
  },

  // Delete job
  deleteJob: (id, callback) => {
    db.run('DELETE FROM jobs WHERE id = ?', [id], callback);
  },

  // Get jobs by status
  getJobsByStatus: (status, callback) => {
    db.all('SELECT * FROM jobs WHERE status = ? ORDER BY createdAt DESC', [status], callback);
  },

  // Search jobs
  searchJobs: (query, callback) => {
    const searchQuery = `%${query}%`;
    const stmt = `
      SELECT * FROM jobs 
      WHERE company LIKE ? OR position LIKE ? OR notes LIKE ?
      ORDER BY createdAt DESC
    `;
    db.all(stmt, [searchQuery, searchQuery, searchQuery], callback);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nClosing database connection...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = {
  db,
  ...dbHelpers
};