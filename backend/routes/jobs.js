const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Job validation rules
const jobValidationRules = () => {
  return [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('company')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Company must be between 1 and 100 characters'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location must be less than 100 characters'),
    body('jobType')
      .optional()
      .isIn(['full-time', 'part-time', 'contract', 'temporary', 'internship'])
      .withMessage('Invalid job type'),
    body('salary')
      .optional()
      .isNumeric()
      .withMessage('Salary must be a number'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    body('requirements')
      .optional()
      .isArray()
      .withMessage('Requirements must be an array'),
    body('benefits')
      .optional()
      .isArray()
      .withMessage('Benefits must be an array'),
    body('applicationDeadline')
      .optional()
      .isISO8601()
      .withMessage('Application deadline must be a valid date'),
    body('status')
      .optional()
      .isIn(['draft', 'active', 'paused', 'closed'])
      .withMessage('Invalid status'),
    body('remoteAllowed')
      .optional()
      .isBoolean()
      .withMessage('Remote allowed must be a boolean')
  ];
};

// Update validation rules (partial updates allowed)
const jobUpdateValidationRules = () => {
  return [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('company')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Company must be between 1 and 100 characters'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location must be less than 100 characters'),
    body('jobType')
      .optional()
      .isIn(['full-time', 'part-time', 'contract', 'temporary', 'internship'])
      .withMessage('Invalid job type'),
    body('salary')
      .optional()
      .isNumeric()
      .withMessage('Salary must be a number'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters'),
    body('requirements')
      .optional()
      .isArray()
      .withMessage('Requirements must be an array'),
    body('benefits')
      .optional()
      .isArray()
      .withMessage('Benefits must be an array'),
    body('applicationDeadline')
      .optional()
      .isISO8601()
      .withMessage('Application deadline must be a valid date'),
    body('status')
      .optional()
      .isIn(['draft', 'active', 'paused', 'closed'])
      .withMessage('Invalid status'),
    body('remoteAllowed')
      .optional()
      .isBoolean()
      .withMessage('Remote allowed must be a boolean')
  ];
};

// Query validation for filtering
const filterValidationRules = () => {
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
      .isIn(['draft', 'active', 'paused', 'closed'])
      .withMessage('Invalid status filter'),
    query('jobType')
      .optional()
      .isIn(['full-time', 'part-time', 'contract', 'temporary', 'internship'])
      .withMessage('Invalid job type filter'),
    query('minSalary')
      .optional()
      .isNumeric()
      .withMessage('Minimum salary must be a number'),
    query('maxSalary')
      .optional()
      .isNumeric()
      .withMessage('Maximum salary must be a number'),
    query('remoteAllowed')
      .optional()
      .isBoolean()
      .withMessage('Remote allowed filter must be a boolean'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters')
  ];
};

// ID parameter validation
const validateObjectId = () => {
  return [
    param('id')
      .isMongoId()
      .withMessage('Invalid job ID format')
  ];
};

// @route   GET /api/jobs
// @desc    Get all jobs with filtering and pagination
// @access  Public
router.get('/', filterValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      jobType,
      minSalary,
      maxSalary,
      remoteAllowed,
      search,
      location,
      company
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (jobType) filter.jobType = jobType;
    if (remoteAllowed !== undefined) filter.remoteAllowed = remoteAllowed === 'true';
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (company) filter.company = { $regex: company, $options: 'i' };
    
    // Salary range filter
    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = Number(minSalary);
      if (maxSalary) filter.salary.$lte = Number(maxSalary);
    }

    // Text search across multiple fields
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limit);

    // Fetch jobs with pagination and sorting
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('postedBy', 'name email')
      .select('-__v');

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalJobs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      message: `Found ${jobs.length} jobs`
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (requires authentication)
router.post('/', auth, jobValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    // Create new job
    const job = new Job(jobData);
    await job.save();

    // Populate the postedBy field for response
    await job.populate('postedBy', 'name email');

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A job with this title already exists for this company',
        error: 'Duplicate job posting'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get a single job by ID
// @access  Public
router.get('/:id', validateObjectId(), handleValidationErrors, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email')
      .select('-__v');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.viewCount = (job.viewCount || 0) + 1;
    await job.save();

    res.status(200).json({
      success: true,
      data: job,
      message: 'Job retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job by ID
// @access  Private (job owner or admin)
router.put('/:id', auth, validateObjectId(), jobUpdateValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns this job or is admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Update job with provided fields
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('postedBy', 'name email');

    res.status(200).json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job by ID
// @access  Private (job owner or admin)
router.delete('/:id', auth, validateObjectId(), handleValidationErrors, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns this job or is admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: { deletedJobId: req.params.id }
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PATCH /api/jobs/:id/status
// @desc    Update job status only
// @access  Private (job owner or admin)
router.patch('/:id/status', 
  auth, 
  validateObjectId(),
  [
    body('status')
      .isIn(['draft', 'active', 'paused', 'closed'])
      .withMessage('Invalid status')
  ],
  handleValidationErrors, 
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check if user owns this job or is admin
      if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this job'
        });
      }

      job.status = req.body.status;
      job.updatedAt = new Date();
      await job.save();

      res.status(200).json({
        success: true,
        data: { status: job.status },
        message: `Job status updated to ${job.status}`
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating job status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;