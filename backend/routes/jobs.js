const express = require('express');
const router = express.Router();

// In-memory storage for demonstration (in production, use a database)
// This would typically be replaced with database operations
let jobs = [
  {
    id: 1,
    title: 'Full Stack Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    description: 'Looking for an experienced full stack developer...',
    salary: '$120,000 - $150,000',
    requirements: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    type: 'full-time',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    description: 'Join our dynamic team as a frontend developer...',
    salary: '$90,000 - $110,000',
    requirements: ['React', 'TypeScript', 'CSS3', 'HTML5'],
    type: 'full-time',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  }
];

// Counter for generating unique IDs (in production, use database auto-increment)
let nextId = 3;

// Validation middleware for job data
const validateJobData = (req, res, next) => {
  const { title, company, location, description } = req.body;
  
  // Check for required fields
  const requiredFields = ['title', 'company', 'location', 'description'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields
    });
  }
  
  // Validate field types and lengths
  if (typeof title !== 'string' || title.length < 3 || title.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Title must be a string between 3 and 100 characters'
    });
  }
  
  if (typeof company !== 'string' || company.length < 2 || company.length > 50) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Company must be a string between 2 and 50 characters'
    });
  }
  
  if (typeof location !== 'string' || location.length < 3 || location.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Location must be a string between 3 and 100 characters'
    });
  }
  
  if (typeof description !== 'string' || description.length < 10 || description.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Description must be a string between 10 and 1000 characters'
    });
  }
  
  next();
};

// Utility function to find job by ID
const findJobById = (id) => {
  const jobId = parseInt(id);
  return jobs.find(job => job.id === jobId);
};

// REST API PRINCIPLE: GET /api/jobs - Retrieve all resources
// This endpoint follows REST convention for listing all items in a collection
// HTTP GET is idempotent and safe - it doesn't modify server state
router.get('/api/jobs', (req, res) => {
  try {
    // Query parameters for filtering and pagination (REST best practice)
    const { company, location, type, page = 1, limit = 10 } = req.query;
    
    let filteredJobs = [...jobs];
    
    // Apply filters if provided
    if (company) {
      filteredJobs = filteredJobs.filter(job => 
        job.company.toLowerCase().includes(company.toLowerCase())
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
    
    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
    
    // REST best practice: Include metadata about the collection
    res.status(200).json({
      success: true,
      data: paginatedJobs,
      meta: {
        total: filteredJobs.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredJobs.length / limit)
      },
      message: 'Jobs retrieved successfully'
    });
  } catch (error) {
    // Error handling: Always provide meaningful error responses
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving jobs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// REST API PRINCIPLE: POST /api/jobs - Create a new resource
// HTTP POST is neither safe nor idempotent - it creates new resources
// Should return 201 (Created) status code on success
router.post('/api/jobs', validateJobData, (req, res) => {
  try {
    const { title, company, location, description, salary, requirements, type } = req.body;
    
    // Create new job object with server-generated data
    const newJob = {
      id: nextId++, // Auto-increment ID (use database auto-increment in production)
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description.trim(),
      salary: salary || null,
      requirements: requirements || [],
      type: type || 'full-time',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to collection
    jobs.push(newJob);
    
    // REST principle: Return 201 Created with the created resource
    // Include Location header pointing to the new resource
    res.status(201).json({
      success: true,
      data: newJob,
      message: 'Job created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while creating the job',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// REST API PRINCIPLE: PUT /api/jobs/:id - Update/Replace an entire resource
// HTTP PUT is idempotent - multiple identical requests have the same effect
// Should completely replace the resource (partial updates use PATCH)
router.put('/api/jobs/:id', validateJobData, (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    // Validate ID parameter
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid job ID. ID must be a number.'
      });
    }
    
    // Find existing job
    const existingJobIndex = jobs.findIndex(job => job.id === jobId);
    
    if (existingJobIndex === -1) {
      // REST principle: Return 404 for non-existent resources
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Job with ID ${jobId} not found`
      });
    }
    
    const { title, company, location, description, salary, requirements, type } = req.body;
    
    // Create updated job object (PUT replaces entire resource)
    const updatedJob = {
      id: jobId, // Keep original ID
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description.trim(),
      salary: salary || null,
      requirements: requirements || [],
      type: type || 'full-time',
      createdAt: jobs[existingJobIndex].createdAt, // Preserve creation date
      updatedAt: new Date() // Update modification date
    };
    
    // Replace the job in the array
    jobs[existingJobIndex] = updatedJob;
    
    // Return 200 OK with updated resource
    res.status(200).json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while updating the job',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// REST API PRINCIPLE: DELETE /api/jobs/:id - Delete a specific resource
// HTTP DELETE is idempotent - deleting a non-existent resource is not an error
// Should return 204 (No Content) or 200 (OK) depending on response body
router.delete('/api/jobs/:id', (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    // Validate ID parameter
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid job ID. ID must be a number.'
      });
    }
    
    // Find job to delete
    const jobIndex = jobs.findIndex(job => job.id === jobId);
    
    if (jobIndex === -1) {
      // REST principle: DELETE is idempotent, so 404 vs 204 is debatable
      // We'll return 404 to inform client the resource didn't exist
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Job with ID ${jobId} not found`
      });
    }
    
    // Store job data before deletion for response
    const deletedJob = jobs[jobIndex];
    
    // Remove job from array
    jobs.splice(jobIndex, 1);
    
    // Return 200 OK with deleted resource info
    // Alternative: Return 204 No Content with no body
    res.status(200).json({
      success: true,
      data: {
        id: deletedJob.id,
        title: deletedJob.title
      },
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while deleting the job',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// REST API PRINCIPLE: GET /api/jobs/:id - Retrieve a specific resource
// This is a common REST pattern for accessing individual items
router.get('/api/jobs/:id', (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    // Validate ID parameter
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid job ID. ID must be a number.'
      });
    }
    
    // Find specific job
    const job = findJobById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Job with ID ${jobId} not found`
      });
    }
    
    // Return specific job
    res.status(200).json({
      success: true,
      data: job,
      message: 'Job retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving the job',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Jobs Router Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred in the jobs router',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

/*
=== REST API PRINCIPLES IMPLEMENTED ===

1. RESOURCE-BASED URLs:
   - /api/jobs (collection)
   - /api/jobs/:id (individual resource)

2. HTTP METHODS WITH SEMANTIC MEANING:
   - GET: Retrieve (safe, idempotent)
   - POST: Create (neither safe nor idempotent)
   - PUT: Update/Replace (idempotent, not safe)
   - DELETE: Remove (idempotent, not safe)

3. PROPER HTTP STATUS CODES:
   - 200 OK: Successful GET, PUT, DELETE
   - 201 Created: Successful POST
   - 400 Bad Request: Invalid input
   - 404 Not Found: Resource doesn't exist
   - 500 Internal Server Error: Server errors

4. CONSISTENT RESPONSE FORMAT:
   - Always include success boolean
   - Include data, error, and message fields
   - Provide metadata for collections

5. STATELESS OPERATIONS:
   - Each request contains all necessary information
   - Server doesn't store client context

6. PROPER ERROR HANDLING:
   - Meaningful error messages
   - Appropriate status codes
   - Validation feedback

7. QUERY PARAMETERS FOR FILTERING:
   - Support for filtering and pagination
   - Non-destructive query operations

=== USAGE EXAMPLES ===

// Get all jobs
GET /api/jobs
GET /api/jobs?company=TechCorp&page=2&limit=5

// Get specific job
GET /api/jobs/1

// Create new job
POST /api/jobs
Body: {
  "title": "Backend Developer",
  "company": "NewTech",
  "location": "Austin, TX",
  "description": "We are looking for..."
}

// Update job
PUT /api/jobs/1
Body: {
  "title": "Senior Backend Developer",
  "company": "NewTech",
  "location": "Austin, TX",
  "description": "Updated description..."
}

// Delete job
DELETE /api/jobs/1

*/

module.exports = router;