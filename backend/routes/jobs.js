const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

// In-memory storage for jobs (replace with database in production)
let jobs = [];
let nextId = 1;

// Validation middleware
const validateJob = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('company')
    .notEmpty()
    .withMessage('Company is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Company must be between 1 and 100 characters'),
  body('status')
    .isIn(['applied', 'interviewing', 'offered', 'rejected', 'withdrawn'])
    .withMessage('Status must be one of: applied, interviewing, offered, rejected, withdrawn'),
  body('dateApplied')
    .isISO8601()
    .withMessage('Date applied must be a valid ISO 8601 date'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Helper function to find job by ID
const findJobById = (id) => {
  return jobs.find(job => job.id === parseInt(id));
};

// GET /jobs - Get all jobs
router.get('/jobs', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve jobs'
    });
  }
});

// POST /jobs - Create new job
router.post('/jobs', validateJob, handleValidationErrors, (req, res) => {
  try {
    const { title, company, status, dateApplied, description } = req.body;
    
    const newJob = {
      id: nextId++,
      title,
      company,
      status,
      dateApplied: new Date(dateApplied).toISOString(),
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    jobs.push(newJob);
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: newJob
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create job'
    });
  }
});

// PUT /jobs/:id - Update existing job
router.put('/jobs/:id', validateId, validateJob, handleValidationErrors, (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, status, dateApplied, description } = req.body;
    
    const job = findJobById(id);
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: `Job with ID ${id} does not exist`
      });
    }
    
    // Update job properties
    job.title = title;
    job.company = company;
    job.status = status;
    job.dateApplied = new Date(dateApplied).toISOString();
    job.description = description || '';
    job.updatedAt = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update job'
    });
  }
});

// DELETE /jobs/:id - Delete job
router.delete('/jobs/:id', validateId, handleValidationErrors, (req, res) => {
  try {
    const { id } = req.params;
    const jobIndex = jobs.findIndex(job => job.id === parseInt(id));
    
    if (jobIndex === -1) {
      return res.status(404).json({
        error: 'Job not found',
        message: `Job with ID ${id} does not exist`
      });
    }
    
    const deletedJob = jobs.splice(jobIndex, 1)[0];
    
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: deletedJob
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete job'
    });
  }
});

// GET /jobs/:id - Get single job (bonus endpoint)
router.get('/jobs/:id', validateId, handleValidationErrors, (req, res) => {
  try {
    const { id } = req.params;
    const job = findJobById(id);
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: `Job with ID ${id} does not exist`
      });
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve job'
    });
  }
});

module.exports = router;