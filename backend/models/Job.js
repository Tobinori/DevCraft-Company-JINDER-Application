const mongoose = require('mongoose');

/**
 * Job Application Schema for JINDER
 * 
 * This schema represents a job application in our system.
 * Each job application contains information about the position,
 * company, application status, and user notes.
 * 
 * Key Learning Points:
 * - Mongoose Schema definition and validation
 * - Enum types for controlled values
 * - Index optimization for query performance
 * - Timestamps for audit trails
 * - Required vs optional fields
 * - Data type specifications
 */

// Define the job application schema
const jobSchema = new mongoose.Schema({
  /**
   * Job Title - The position being applied for
   * - Required field to ensure every application has a title
   * - Trimmed to remove extra whitespace
   * - Maximum length to prevent excessively long titles
   */
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters'],
    minlength: [2, 'Job title must be at least 2 characters long']
  },

  /**
   * Company Name - The organization offering the position
   * - Required field for identification
   * - Indexed for faster company-based searches
   * - Trimmed for consistency
   */
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
    index: true // Index for faster company searches
  },

  /**
   * Job Location - Where the job is based
   * - Can include city, state, country, or "Remote"
   * - Optional field as some jobs might not specify location
   * - Indexed for location-based filtering
   */
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    index: true // Index for location-based searches
  },

  /**
   * Salary Information - Compensation details
   * - Stored as object to handle different salary formats
   * - Can include min, max, currency, and period (annual/hourly)
   * - All fields optional as salary info might not always be available
   */
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      validate: {
        validator: function(value) {
          // Custom validator: max salary should be >= min salary
          return !this.salary.min || value >= this.salary.min;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary'
      }
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'],
      uppercase: true
    },
    period: {
      type: String,
      enum: ['annual', 'monthly', 'hourly'],
      default: 'annual',
      lowercase: true
    }
  },

  /**
   * Job Description - Details about the role
   * - Text field for longer content
   * - Optional but recommended for better job tracking
   * - Limited length to prevent database bloat
   */
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  /**
   * Application Status - Current stage of the application
   * - Enum type ensures only valid statuses are stored
   * - Default is 'applied' for new applications
   * - Indexed for filtering by status
   * - Required field for application tracking
   */
  status: {
    type: String,
    required: [true, 'Application status is required'],
    enum: {
      values: ['applied', 'interview', 'offer', 'rejected'],
      message: 'Status must be one of: applied, interview, offer, rejected'
    },
    default: 'applied',
    lowercase: true,
    index: true // Index for status-based filtering
  },

  /**
   * Application Date - When the application was submitted
   * - Date type for proper date handling
   * - Required field for chronological tracking
   * - Indexed for date-based queries and sorting
   */
  applicationDate: {
    type: Date,
    required: [true, 'Application date is required'],
    index: true, // Index for date-based queries
    validate: {
      validator: function(value) {
        // Application date should not be in the future
        return value <= new Date();
      },
      message: 'Application date cannot be in the future'
    }
  },

  /**
   * User Notes - Personal notes about the application
   * - Optional field for user's personal tracking
   * - Can include interview feedback, follow-up reminders, etc.
   * - Limited length to prevent excessive storage usage
   */
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  /**
   * User Reference - Links job application to specific user
   * - ObjectId reference to User model
   * - Required to associate applications with users
   * - Indexed for user-specific queries
   */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true // Index for user-specific queries
  }

}, {
  /**
   * Schema Options
   * - timestamps: Automatically adds createdAt and updatedAt fields
   * - versionKey: Keeps the __v field for document versioning
   */
  timestamps: true, // Automatically adds createdAt and updatedAt
  
  /**
   * Transform function for JSON output
   * - Removes sensitive/unnecessary fields from API responses
   * - Converts _id to id for frontend consistency
   */
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * INDEXES for Performance Optimization
 * 
 * Compound indexes for common query patterns:
 * 1. User-specific queries with status filtering
 * 2. User-specific queries with date sorting
 * 3. Company and location searches
 */

// Compound index for user + status queries (most common)
jobSchema.index({ userId: 1, status: 1 });

// Compound index for user + date queries (for chronological sorting)
jobSchema.index({ userId: 1, applicationDate: -1 });

// Text index for search functionality across title, company, and description
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text'
});

/**
 * INSTANCE METHODS
 * Methods that can be called on individual job documents
 */

/**
 * Check if application is still active (not rejected)
 * @returns {boolean} True if application is active
 */
jobSchema.methods.isActive = function() {
  return this.status !== 'rejected';
};

/**
 * Get days since application was submitted
 * @returns {number} Number of days since application
 */
jobSchema.methods.getDaysSinceApplication = function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.applicationDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format salary for display
 * @returns {string} Formatted salary string
 */
jobSchema.methods.getFormattedSalary = function() {
  if (!this.salary.min && !this.salary.max) {
    return 'Salary not specified';
  }
  
  const currency = this.salary.currency || 'USD';
  const period = this.salary.period || 'annual';
  
  let salaryStr = '';
  if (this.salary.min && this.salary.max) {
    salaryStr = `${currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
  } else if (this.salary.min) {
    salaryStr = `${currency} ${this.salary.min.toLocaleString()}+`;
  } else {
    salaryStr = `Up to ${currency} ${this.salary.max.toLocaleString()}`;
  }
  
  return `${salaryStr} (${period})`;
};

/**
 * STATIC METHODS
 * Methods that can be called on the Job model itself
 */

/**
 * Find jobs by status for a specific user
 * @param {string} userId - User's ObjectId
 * @param {string} status - Application status
 * @returns {Promise} Query promise
 */
jobSchema.statics.findByUserAndStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ applicationDate: -1 });
};

/**
 * Get application statistics for a user
 * @param {string} userId - User's ObjectId
 * @returns {Promise} Statistics object
 */
jobSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

/**
 * PRE-SAVE MIDDLEWARE
 * Runs before saving a document
 */
jobSchema.pre('save', function(next) {
  // Ensure application date is set if not provided
  if (!this.applicationDate) {
    this.applicationDate = new Date();
  }
  
  // Convert status to lowercase for consistency
  if (this.status) {
    this.status = this.status.toLowerCase();
  }
  
  next();
});

/**
 * POST-SAVE MIDDLEWARE
 * Runs after saving a document
 */
jobSchema.post('save', function(doc, next) {
  console.log(`Job application saved: ${doc.title} at ${doc.company}`);
  next();
});

// Create and export the model
const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

/**
 * USAGE EXAMPLES FOR TRAINEES:
 * 
 * // Create a new job application
 * const newJob = new Job({
 *   title: 'Software Developer',
 *   company: 'Tech Corp',
 *   location: 'San Francisco, CA',
 *   salary: { min: 80000, max: 120000, currency: 'USD', period: 'annual' },
 *   description: 'Full-stack development position...',
 *   status: 'applied',
 *   applicationDate: new Date(),
 *   userId: user._id
 * });
 * 
 * // Save the job application
 * await newJob.save();
 * 
 * // Find jobs by user and status
 * const activeJobs = await Job.findByUserAndStatus(userId, 'applied');
 * 
 * // Get user statistics
 * const stats = await Job.getUserStats(userId);
 * 
 * // Use instance methods
 * console.log(newJob.isActive()); // true
 * console.log(newJob.getDaysSinceApplication()); // number of days
 * console.log(newJob.getFormattedSalary()); // formatted salary string
 */