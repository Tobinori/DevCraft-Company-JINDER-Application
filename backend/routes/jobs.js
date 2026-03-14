const express = require('express');
const router = express.Router();

// In-memory storage for jobs (in a real app, this would be a database)
let jobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120,000 - $150,000',
    description: 'We are looking for a senior software engineer to join our team.',
    requirements: ['5+ years experience', 'JavaScript', 'Node.js', 'React'],
    type: 'full-time',
    remote: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    salary: '$80,000 - $100,000',
    description: 'Join our growing startup as a frontend developer.',
    requirements: ['3+ years experience', 'React', 'CSS', 'TypeScript'],
    type: 'full-time',
    remote: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextJobId = 3;

// Validation middleware for job data
const validateJobData = (req, res, next) => {
  const { title, company, location, description } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (!company || company.trim().length === 0) {
    errors.push('Company is required');
  }
  if (!location || location.trim().length === 0) {
    errors.push('Location is required');
  }
  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Helper function to find job by ID
const findJobById = (id) => {
  return jobs.find(job => job.id === parseInt(id));
};

// GET /jobs - Get all jobs
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search, location, type, remote } = req.query;
    let filteredJobs = [...jobs];

    // Apply search filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower)
      );
    }

    if (location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (type) {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }

    if (remote !== undefined) {
      filteredJobs = filteredJobs.filter(job => job.remote === (remote === 'true'));
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredJobs.length,
        pages: Math.ceil(filteredJobs.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /jobs/:id - Get single job by ID
router.get('/:id', (req, res) => {
  try {
    const job = findJobById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /jobs - Create new job
router.post('/', validateJobData, (req, res) => {
  try {
    const {
      title,
      company,
      location,
      salary,
      description,
      requirements = [],
      type = 'full-time',
      remote = false
    } = req.body;

    const newJob = {
      id: nextJobId++,
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      salary: salary ? salary.trim() : null,
      description: description.trim(),
      requirements: Array.isArray(requirements) ? requirements : [],
      type,
      remote: Boolean(remote),
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
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /jobs/:id - Update existing job
router.put('/:id', validateJobData, (req, res) => {
  try {
    const jobIndex = jobs.findIndex(job => job.id === parseInt(req.params.id));
    
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const {
      title,
      company,
      location,
      salary,
      description,
      requirements,
      type,
      remote
    } = req.body;

    // Update job with new data
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      salary: salary ? salary.trim() : jobs[jobIndex].salary,
      description: description.trim(),
      requirements: requirements !== undefined ? requirements : jobs[jobIndex].requirements,
      type: type !== undefined ? type : jobs[jobIndex].type,
      remote: remote !== undefined ? Boolean(remote) : jobs[jobIndex].remote,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: jobs[jobIndex]
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /jobs/:id - Delete job
router.delete('/:id', (req, res) => {
  try {
    const jobIndex = jobs.findIndex(job => job.id === parseInt(req.params.id));
    
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const deletedJob = jobs.splice(jobIndex, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: deletedJob
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Jobs router error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

module.exports = router;