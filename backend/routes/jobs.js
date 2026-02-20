const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const router = express.Router();

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation rules
const jobValidationRules = () => {
  return [
    body('title')
      .notEmpty()
      .withMessage('Job title is required')
      .isLength({ min: 2, max: 200 })
      .withMessage('Job title must be between 2 and 200 characters'),
    body('company')
      .notEmpty()
      .withMessage('Company name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters'),
    body('location')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Location must be less than 100 characters'),
    body('salary')
      .optional()
      .isNumeric()
      .withMessage('Salary must be a number'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    body('status')
      .optional()
      .isIn(['applied', 'interview', 'offer', 'rejected', 'withdrawn'])
      .withMessage('Status must be one of: applied, interview, offer, rejected, withdrawn'),
    body('applicationDate')
      .optional()
      .isISO8601()
      .withMessage('Application date must be a valid date'),
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters'),
    body('jobUrl')
      .optional()
      .isURL()
      .withMessage('Job URL must be a valid URL')
  ];
};

const updateJobValidationRules = () => {
  return [
    body('title')
      .optional()
      .isLength({ min: 2, max: 200 })
      .withMessage('Job title must be between 2 and 200 characters'),
    body('company')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters'),
    body('location')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Location must be less than 100 characters'),
    body('salary')
      .optional()
      .isNumeric()
      .withMessage('Salary must be a number'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    body('status')
      .optional()
      .isIn(['applied', 'interview', 'offer', 'rejected', 'withdrawn'])
      .withMessage('Status must be one of: applied, interview, offer, rejected, withdrawn'),
    body('applicationDate')
      .optional()
      .isISO8601()
      .withMessage('Application date must be a valid date'),
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters'),
    body('jobUrl')
      .optional()
      .isURL()
      .withMessage('Job URL must be a valid URL')
  ];
};

const queryValidationRules = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['applied', 'interview', 'offer', 'rejected', 'withdrawn'])
      .withMessage('Status must be one of: applied, interview, offer, rejected, withdrawn'),
    query('company')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Company filter must be between 1 and 100 characters'),
    query('location')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Location filter must be between 1 and 100 characters'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'applicationDate', 'title', 'company', 'salary'])
      .withMessage('Sort field must be one of: createdAt, applicationDate, title, company, salary'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ];
};

const idValidationRules = () => {
  return [
    param('id')
      .isMongoId()
      .withMessage('Invalid job ID format')
  ];
};

// @route   GET /api/jobs
// @desc    Get all jobs with filtering and pagination
// @access  Private
router.get('/',
  auth,
  queryValidationRules(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        company,
        location,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search
      } = req.query;

      // Build filter object
      const filter = { userId: req.user.id };

      if (status) {
        filter.status = status;
      }

      if (company) {
        filter.company = { $regex: company, $options: 'i' };
      }

      if (location) {
        filter.location = { $regex: location, $options: 'i' };
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate pagination
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      // Execute queries
      const [jobs, totalJobs] = await Promise.all([
        Job.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNumber)
          .lean(),
        Job.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalJobs / limitNumber);
      const hasNextPage = pageNumber < totalPages;
      const hasPrevPage = pageNumber > 1;

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalJobs,
            hasNextPage,
            hasPrevPage,
            limit: limitNumber
          }
        }
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching jobs'
      });
    }
  })
);

// @route   POST /api/jobs
// @desc    Create a new job application
// @access  Private
router.post('/',
  auth,
  jobValidationRules(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const jobData = {
        ...req.body,
        userId: req.user.id
      };

      // Set default application date if not provided
      if (!jobData.applicationDate) {
        jobData.applicationDate = new Date();
      }

      // Set default status if not provided
      if (!jobData.status) {
        jobData.status = 'applied';
      }

      const job = new Job(jobData);
      await job.save();

      res.status(201).json({
        success: true,
        message: 'Job application created successfully',
        data: job
      });
    } catch (error) {
      console.error('Error creating job:', error);
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'A job application with similar details already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while creating job application'
      });
    }
  })
);

// @route   GET /api/jobs/:id
// @desc    Get a single job by ID
// @access  Private
router.get('/:id',
  auth,
  idValidationRules(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const job = await Job.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching job application'
      });
    }
  })
);

// @route   PUT /api/jobs/:id
// @desc    Update a job application
// @access  Private
router.put('/:id',
  auth,
  idValidationRules(),
  updateJobValidationRules(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const job = await Job.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      // Update job with new data
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          job[key] = req.body[key];
        }
      });

      job.updatedAt = new Date();
      await job.save();

      res.json({
        success: true,
        message: 'Job application updated successfully',
        data: job
      });
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating job application'
      });
    }
  })
);

// @route   DELETE /api/jobs/:id
// @desc    Delete a job application
// @access  Private
router.delete('/:id',
  auth,
  idValidationRules(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const job = await Job.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      await Job.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Job application deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting job application'
      });
    }
  })
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Jobs router error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in jobs routes'
  });
});

module.exports = router;