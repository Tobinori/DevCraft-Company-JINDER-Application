/**
 * Job Model Class
 * 
 * This file demonstrates the Model pattern in backend development.
 * The Model represents the data structure and business logic for job applications.
 * It encapsulates all job-related operations and validation rules.
 * 
 * Key Concepts:
 * - Constructor pattern for object initialization
 * - Instance methods for object-specific operations
 * - Static methods for class-level operations (CRUD)
 * - Data validation and sanitization
 * - Error handling patterns
 */

class Job {
  /**
   * Job Constructor
   * 
   * Creates a new Job instance with the provided properties.
   * This follows the constructor pattern where we initialize
   * all necessary properties for a job application.
   * 
   * @param {Object} jobData - Object containing job properties
   * @param {string} jobData.title - Job title/position
   * @param {string} jobData.company - Company name
   * @param {string} jobData.status - Application status (applied, interview, rejected, offer)
   * @param {Date|string} jobData.dateApplied - Date when application was submitted
   * @param {string} jobData.description - Job description
   * @param {number} jobData.salary - Salary amount (optional)
   * @param {string} jobData.location - Job location
   * @param {string} jobData.userId - ID of user who owns this job application
   */
  constructor({
    title,
    company,
    status = 'applied', // Default status
    dateApplied = new Date(),
    description = '',
    salary = null,
    location = '',
    userId,
    id = null // For existing jobs loaded from database
  }) {
    // Core properties - these are required for every job
    this.id = id;
    this.title = title;
    this.company = company;
    this.status = status;
    this.userId = userId;
    
    // Date handling - ensure we have a proper Date object
    this.dateApplied = dateApplied instanceof Date ? dateApplied : new Date(dateApplied);
    
    // Optional properties - provide defaults for better UX
    this.description = description;
    this.salary = salary;
    this.location = location;
    
    // Metadata - useful for tracking changes
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Instance Method: Validate Job Data
   * 
   * This method validates the current job instance.
   * Instance methods operate on a specific job object.
   * They have access to 'this' which refers to the current instance.
   * 
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validate() {
    const errors = [];
    
    // Required field validation
    if (!this.title || this.title.trim().length === 0) {
      errors.push('Job title is required');
    }
    
    if (!this.company || this.company.trim().length === 0) {
      errors.push('Company name is required');
    }
    
    if (!this.userId) {
      errors.push('User ID is required');
    }
    
    // Status validation - must be one of predefined values
    const validStatuses = ['applied', 'interview', 'rejected', 'offer', 'accepted'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Status must be one of: ' + validStatuses.join(', '));
    }
    
    // Salary validation - if provided, must be positive number
    if (this.salary !== null && (isNaN(this.salary) || this.salary < 0)) {
      errors.push('Salary must be a positive number');
    }
    
    // Date validation
    if (!(this.dateApplied instanceof Date) || isNaN(this.dateApplied.getTime())) {
      errors.push('Date applied must be a valid date');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Instance Method: Update Job Properties
   * 
   * Updates the job with new data and refreshes the updatedAt timestamp.
   * This demonstrates how instance methods can modify object state.
   * 
   * @param {Object} updates - Object containing properties to update
   * @returns {Job} Returns this instance for method chaining
   */
  update(updates) {
    // Only update properties that exist in the updates object
    const allowedUpdates = ['title', 'company', 'status', 'description', 'salary', 'location'];
    
    allowedUpdates.forEach(field => {
      if (updates.hasOwnProperty(field)) {
        this[field] = updates[field];
      }
    });
    
    // Always update the timestamp when job is modified
    this.updatedAt = new Date();
    
    return this; // Return this for method chaining
  }

  /**
   * Instance Method: Convert to JSON
   * 
   * Converts the job instance to a plain JavaScript object.
   * Useful for API responses and database storage.
   * 
   * @returns {Object} Plain object representation of the job
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      company: this.company,
      status: this.status,
      dateApplied: this.dateApplied,
      description: this.description,
      salary: this.salary,
      location: this.location,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ========================================
  // STATIC METHODS (CLASS-LEVEL OPERATIONS)
  // ========================================
  
  /**
   * Static methods belong to the class, not to instances.
   * They are called on the class itself: Job.create()
   * These methods typically handle database operations (CRUD).
   * In a real application, these would interact with a database.
   */

  /**
   * Static Method: Create New Job
   * 
   * Creates a new job in the database.
   * This is a factory method that creates and saves a job.
   * 
   * @param {Object} jobData - Data for the new job
   * @returns {Promise<Job>} Promise resolving to the created job
   */
  static async create(jobData) {
    try {
      // Create new job instance
      const job = new Job(jobData);
      
      // Validate before saving
      const validation = job.validate();
      if (!validation.isValid) {
        throw new Error('Validation failed: ' + validation.errors.join(', '));
      }
      
      // In a real app, this would save to database
      // For now, we'll simulate with a generated ID
      job.id = this.generateId();
      
      // Simulate database save operation
      await this.simulateDatabaseSave(job);
      
      return job;
    } catch (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }
  }

  /**
   * Static Method: Find Job by ID
   * 
   * Retrieves a job from the database by its ID.
   * This demonstrates the Repository pattern for data access.
   * 
   * @param {string} jobId - ID of the job to find
   * @returns {Promise<Job|null>} Promise resolving to job or null if not found
   */
  static async findById(jobId) {
    try {
      // In a real app, this would query the database
      const jobData = await this.simulateDatabaseFind(jobId);
      
      if (!jobData) {
        return null;
      }
      
      // Create Job instance from database data
      return new Job(jobData);
    } catch (error) {
      throw new Error(`Failed to find job: ${error.message}`);
    }
  }

  /**
   * Static Method: Find Jobs by User ID
   * 
   * Retrieves all jobs for a specific user.
   * Demonstrates querying with filters.
   * 
   * @param {string} userId - ID of the user
   * @param {Object} options - Query options (limit, offset, status filter)
   * @returns {Promise<Job[]>} Promise resolving to array of jobs
   */
  static async findByUserId(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        status = null,
        sortBy = 'dateApplied',
        sortOrder = 'desc'
      } = options;
      
      // In a real app, this would build and execute a database query
      const jobsData = await this.simulateDatabaseQuery({
        userId,
        limit,
        offset,
        status,
        sortBy,
        sortOrder
      });
      
      // Convert database results to Job instances
      return jobsData.map(data => new Job(data));
    } catch (error) {
      throw new Error(`Failed to find jobs for user: ${error.message}`);
    }
  }

  /**
   * Static Method: Update Job
   * 
   * Updates an existing job in the database.
   * 
   * @param {string} jobId - ID of job to update
   * @param {Object} updates - Properties to update
   * @returns {Promise<Job>} Promise resolving to updated job
   */
  static async updateById(jobId, updates) {
    try {
      // First, find the existing job
      const existingJob = await this.findById(jobId);
      
      if (!existingJob) {
        throw new Error('Job not found');
      }
      
      // Update the job instance
      existingJob.update(updates);
      
      // Validate after updates
      const validation = existingJob.validate();
      if (!validation.isValid) {
        throw new Error('Validation failed: ' + validation.errors.join(', '));
      }
      
      // Save to database
      await this.simulateDatabaseUpdate(existingJob);
      
      return existingJob;
    } catch (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }

  /**
   * Static Method: Delete Job
   * 
   * Removes a job from the database.
   * 
   * @param {string} jobId - ID of job to delete
   * @returns {Promise<boolean>} Promise resolving to success status
   */
  static async deleteById(jobId) {
    try {
      // Verify job exists before deletion
      const existingJob = await this.findById(jobId);
      
      if (!existingJob) {
        return false; // Job doesn't exist
      }
      
      // Perform deletion
      await this.simulateDatabaseDelete(jobId);
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  /**
   * Static Method: Get Job Statistics
   * 
   * Provides analytics data for a user's job applications.
   * Demonstrates aggregation operations.
   * 
   * @param {string} userId - ID of the user
   * @returns {Promise<Object>} Promise resolving to statistics object
   */
  static async getStatistics(userId) {
    try {
      const jobs = await this.findByUserId(userId);
      
      const stats = {
        total: jobs.length,
        byStatus: {},
        averageSalary: 0,
        mostRecentApplication: null,
        oldestApplication: null
      };
      
      // Calculate statistics
      let totalSalary = 0;
      let salaryCount = 0;
      let mostRecentDate = null;
      let oldestDate = null;
      
      jobs.forEach(job => {
        // Count by status
        stats.byStatus[job.status] = (stats.byStatus[job.status] || 0) + 1;
        
        // Calculate average salary
        if (job.salary) {
          totalSalary += job.salary;
          salaryCount++;
        }
        
        // Track date ranges
        const jobDate = job.dateApplied;
        if (!mostRecentDate || jobDate > mostRecentDate) {
          mostRecentDate = jobDate;
          stats.mostRecentApplication = job.toJSON();
        }
        if (!oldestDate || jobDate < oldestDate) {
          oldestDate = jobDate;
          stats.oldestApplication = job.toJSON();
        }
      });
      
      stats.averageSalary = salaryCount > 0 ? Math.round(totalSalary / salaryCount) : 0;
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  // ========================================
  // UTILITY METHODS (PRIVATE/INTERNAL)
  // ========================================

  /**
   * Generate a unique ID for new jobs
   * In a real app, this would be handled by the database
   */
  static generateId() {
    return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Simulate database operations
   * In a real application, these would be replaced with actual database calls
   */
  static async simulateDatabaseSave(job) {
    // Simulate async database operation
    return new Promise(resolve => setTimeout(resolve, 10));
  }

  static async simulateDatabaseFind(jobId) {
    // Simulate database lookup
    return new Promise(resolve => {
      setTimeout(() => {
        // Return mock data or null
        resolve(null); // In real app, would return actual data
      }, 10);
    });
  }

  static async simulateDatabaseQuery(params) {
    // Simulate database query with filters
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([]); // In real app, would return filtered results
      }, 10);
    });
  }

  static async simulateDatabaseUpdate(job) {
    // Simulate database update
    return new Promise(resolve => setTimeout(resolve, 10));
  }

  static async simulateDatabaseDelete(jobId) {
    // Simulate database deletion
    return new Promise(resolve => setTimeout(resolve, 10));
  }
}

/**
 * Export the Job class
 * 
 * This makes the Job class available to other modules.
 * Other files can import and use: const Job = require('./models/Job');
 */
module.exports = Job;

/**
 * USAGE EXAMPLES:
 * 
 * // Creating a new job
 * const job = new Job({
 *   title: 'Frontend Developer',
 *   company: 'Tech Corp',
 *   userId: 'user123'
 * });
 * 
 * // Validating job data
 * const validation = job.validate();
 * if (!validation.isValid) {
 *   console.log('Errors:', validation.errors);
 * }
 * 
 * // Using static methods for CRUD operations
 * const newJob = await Job.create(jobData);
 * const foundJob = await Job.findById(jobId);
 * const userJobs = await Job.findByUserId(userId);
 * const updatedJob = await Job.updateById(jobId, updates);
 * const deleted = await Job.deleteById(jobId);
 * 
 * // Getting statistics
 * const stats = await Job.getStatistics(userId);
 */