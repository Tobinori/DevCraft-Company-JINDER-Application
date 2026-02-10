/**
 * JOBS ROUTER - Complete RESTful API for Job Management
 * 
 * This file demonstrates:
 * - RESTful API design principles
 * - Express.js routing patterns
 * - HTTP method semantics (GET, POST, PUT, DELETE)
 * - Middleware usage for validation and error handling
 * - Proper HTTP status codes
 * - Model integration patterns
 * - Error handling best practices
 */

const express = require('express');
const router = express.Router();
const Job = require('../models/Job'); // Import the Job model

// MIDDLEWARE EXPLANATION:
// Express middleware functions execute in sequence during the request-response cycle
// They have access to request (req), response (res), and next function
// Middleware can modify req/res objects, end the request, or pass control to next middleware

/**
 * VALIDATION MIDDLEWARE
 * Custom middleware to validate job data before processing
 * This demonstrates the middleware pattern for reusable validation logic
 */
const validateJobData = (req, res, next) => {
  const { title, company, location, salary, description, requirements } = req.body;
  const errors = [];

  // Validation rules with detailed explanations
  if (!title || title.trim().length < 2) {
    errors.push('Title is required and must be at least 2 characters long');
  }
  
  if (!company || company.trim().length < 2) {
    errors.push('Company name is required and must be at least 2 characters long');
  }
  
  if (!location || location.trim().length < 2) {
    errors.push('Location is required');
  }
  
  if (!description || description.trim().length < 10) {
    errors.push('Description is required and must be at least 10 characters long');
  }
  
  // Salary validation - should be positive number if provided
  if (salary && (isNaN(salary) || salary < 0)) {
    errors.push('Salary must be a positive number');
  }
  
  // Requirements should be an array if provided
  if (requirements && !Array.isArray(requirements)) {
    errors.push('Requirements must be an array');
  }

  // If validation fails, return 400 Bad Request with error details
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // If validation passes, continue to the next middleware/route handler
  next();
};

/**
 * ERROR HANDLING WRAPPER
 * Higher-order function that wraps async route handlers to catch errors
 * This prevents having to write try-catch blocks in every route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// =============================================================================
// ROUTE DEFINITIONS - Following RESTful conventions
// =============================================================================

/**
 * GET /api/jobs
 * PURPOSE: Retrieve all jobs (READ operation)
 * HTTP METHOD: GET - Used for safe, idempotent operations that don't modify data
 * 
 * REST PRINCIPLES:
 * - GET requests should be safe (no side effects)
 * - Should be idempotent (multiple identical requests have same effect)
 * - Should return collection of resources
 * 
 * QUERY PARAMETERS (optional filtering/pagination):
 * - ?page=1&limit=10 for pagination
 * - ?company=Google for filtering by company
 * - ?location=Remote for filtering by location
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    // Extract query parameters for filtering and pagination
    const { page = 1, limit = 10, company, location, minSalary, maxSalary } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (company) {
      // Case-insensitive search using regex
      filter.company = { $regex: company, $options: 'i' };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    // Salary range filtering
    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = parseInt(minSalary);
      if (maxSalary) filter.salary.$lte = parseInt(maxSalary);
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute database query with filtering, pagination, and sorting
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email'); // If you have user references
    
    // Get total count for pagination metadata
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));
    
    // SUCCESS RESPONSE: 200 OK with data and metadata
    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching jobs:', error);
    
    // SERVER ERROR: 500 Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

/**
 * POST /api/jobs
 * PURPOSE: Create a new job (CREATE operation)
 * HTTP METHOD: POST - Used for non-idempotent operations that create resources
 * 
 * REST PRINCIPLES:
 * - POST requests can have side effects (create new resource)
 * - Not idempotent (multiple requests create multiple resources)
 * - Should return the created resource with 201 status
 * 
 * REQUEST BODY EXPECTED:
 * {
 *   "title": "Software Engineer",
 *   "company": "Tech Corp",
 *   "location": "San Francisco, CA",
 *   "salary": 120000,
 *   "description": "Join our amazing team...",
 *   "requirements": ["JavaScript", "Node.js", "React"]
 * }
 */
router.post('/', validateJobData, asyncHandler(async (req, res) => {
  try {
    // Extract validated data from request body
    const { title, company, location, salary, description, requirements, type } = req.body;
    
    // Create new job instance with validated data
    const newJob = new Job({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      salary: salary ? parseInt(salary) : undefined,
      description: description.trim(),
      requirements: requirements || [],
      type: type || 'full-time',
      // If you have authentication, add user ID:
      // createdBy: req.user.id
    });
    
    // Save to database
    const savedJob = await newJob.save();
    
    // SUCCESS RESPONSE: 201 Created with the new resource
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: savedJob
    });
    
  } catch (error) {
    console.error('Error creating job:', error);
    
    // Handle different types of database errors
    if (error.name === 'ValidationError') {
      // MongoDB validation error - 400 Bad Request
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      // Duplicate key error - 409 Conflict
      return res.status(409).json({
        success: false,
        message: 'Job with similar details already exists'
      });
    }
    
    // SERVER ERROR: 500 Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

/**
 * PUT /api/jobs/:id
 * PURPOSE: Update an existing job (UPDATE operation)
 * HTTP METHOD: PUT - Used for complete resource replacement
 * 
 * REST PRINCIPLES:
 * - PUT should be idempotent (same request multiple times = same result)
 * - Replaces entire resource (partial updates typically use PATCH)
 * - Should return updated resource or 204 No Content
 * 
 * URL PARAMETERS:
 * - :id - The unique identifier of the job to update
 * 
 * REQUEST BODY: Same as POST (complete job object)
 */
router.put('/:id', validateJobData, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, location, salary, description, requirements, type } = req.body;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }
    
    // Find and update the job
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary ? parseInt(salary) : undefined,
        description: description.trim(),
        requirements: requirements || [],
        type: type || 'full-time',
        updatedAt: new Date()
      },
      {
        new: true, // Return the updated document
        runValidators: true // Run mongoose validations
      }
    );
    
    // Check if job was found
    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // SUCCESS RESPONSE: 200 OK with updated resource
    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
    
  } catch (error) {
    console.error('Error updating job:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID'
      });
    }
    
    // SERVER ERROR: 500 Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

/**
 * DELETE /api/jobs/:id
 * PURPOSE: Delete a job (DELETE operation)
 * HTTP METHOD: DELETE - Used for resource removal
 * 
 * REST PRINCIPLES:
 * - DELETE should be idempotent (deleting same resource multiple times = same result)
 * - Should return 204 No Content or 200 OK with confirmation message
 * - Should handle case where resource doesn't exist (404)
 * 
 * URL PARAMETERS:
 * - :id - The unique identifier of the job to delete
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }
    
    // Find and delete the job
    const deletedJob = await Job.findByIdAndDelete(id);
    
    // Check if job was found and deleted
    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or already deleted'
      });
    }
    
    // Optional: Log the deletion for audit purposes
    console.log(`Job deleted: ${deletedJob.title} at ${deletedJob.company}`);
    
    // SUCCESS RESPONSE: 200 OK with confirmation
    // Alternative: 204 No Content (uncomment next line and comment the json response)
    // res.status(204).send();
    
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: {
        deletedJob: {
          id: deletedJob._id,
          title: deletedJob.title,
          company: deletedJob.company
        }
      }
    });
    
  } catch (error) {
    console.error('Error deleting job:', error);
    
    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID'
      });
    }
    
    // SERVER ERROR: 500 Internal Server Error
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

// =============================================================================
// ADDITIONAL UTILITY ROUTES
// =============================================================================

/**
 * GET /api/jobs/:id
 * PURPOSE: Get a specific job by ID (READ single resource)
 * This follows REST convention of GET /resource/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }
    
    // Find job by ID with populated references
    const job = await Job.findById(id).populate('createdBy', 'name email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // SUCCESS RESPONSE: 200 OK with job data
    res.status(200).json({
      success: true,
      message: 'Job retrieved successfully',
      data: job
    });
    
  } catch (error) {
    console.error('Error fetching job:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}));

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

/**
 * Global error handler for this router
 * This middleware catches any errors that weren't handled in route handlers
 * Express error handling middleware must have 4 parameters: (err, req, res, next)
 */
router.use((err, req, res, next) => {
  console.error('Jobs Router Error:', err.stack);
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Something went wrong in jobs router',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// =============================================================================
// EXPORT ROUTER
// =============================================================================

/**
 * Export the router to be used in the main app
 * This router will be mounted at /api/jobs in the main Express app
 * 
 * Usage in app.js:
 * const jobsRouter = require('./routes/jobs');
 * app.use('/api/jobs', jobsRouter);
 */
module.exports = router;

/**
 * SUMMARY OF HTTP STATUS CODES USED:
 * 
 * 200 OK - Successful GET, PUT requests
 * 201 Created - Successful POST request (resource created)
 * 204 No Content - Successful DELETE request (alternative to 200)
 * 400 Bad Request - Invalid request data, validation errors
 * 404 Not Found - Resource doesn't exist
 * 409 Conflict - Resource already exists (duplicate)
 * 500 Internal Server Error - Server-side errors
 * 
 * RESTFUL API CONVENTIONS FOLLOWED:
 * 
 * GET /api/jobs - Get all jobs (with filtering/pagination)
 * GET /api/jobs/:id - Get specific job
 * POST /api/jobs - Create new job
 * PUT /api/jobs/:id - Update entire job
 * DELETE /api/jobs/:id - Delete job
 * 
 * MIDDLEWARE PATTERNS DEMONSTRATED:
 * 
 * 1. Validation middleware - Reusable input validation
 * 2. Error handling middleware - Centralized error processing
 * 3. Async wrapper - Simplified async error handling
 * 4. Route-specific middleware - Applied to specific endpoints
 * 
 * ERROR HANDLING STRATEGIES:
 * 
 * 1. Input validation with detailed error messages
 * 2. Database error categorization and appropriate responses
 * 3. Development vs production error disclosure
 * 4. Consistent error response format
 * 5. Proper HTTP status code usage
 */