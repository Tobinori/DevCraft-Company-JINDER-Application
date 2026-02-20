import axios from 'axios';

/**
 * Job Service API Configuration
 * This file handles all API calls related to job management.
 * It demonstrates proper axios configuration, error handling,
 * and service layer architecture patterns.
 */

// Configure axios instance with base URL and default settings
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Axios instance configured for job-related API calls
 * @type {import('axios').AxiosInstance}
 */
const jobAPI = axios.create({
  baseURL: `${API_BASE_URL}/jobs`,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add authentication token
 * This runs before every request is sent
 */
jobAPI.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage or context
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common errors
 * This runs after every response is received
 */
jobAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          console.error('Resource not found:', data.message);
          break;
        case 500:
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Custom error class for job service errors
 * Provides better error handling and debugging information
 */
class JobServiceError extends Error {
  constructor(message, status = null, originalError = null) {
    super(message);
    this.name = 'JobServiceError';
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * Fetches all jobs with optional filtering and pagination
 * 
 * @param {Object} [params={}] - Query parameters for filtering/pagination
 * @param {string} [params.search] - Search term for job titles/descriptions
 * @param {string} [params.location] - Filter by location
 * @param {string} [params.type] - Filter by job type (full-time, part-time, etc.)
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.limit=10] - Number of jobs per page
 * @param {string} [params.sortBy='createdAt'] - Field to sort by
 * @param {string} [params.sortOrder='desc'] - Sort order (asc/desc)
 * 
 * @returns {Promise<Object>} Promise that resolves to jobs data with pagination info
 * @throws {JobServiceError} When API call fails
 * 
 * @example
 * // Fetch all jobs
 * const jobs = await fetchJobs();
 * 
 * // Fetch jobs with filters
 * const filteredJobs = await fetchJobs({
 *   search: 'developer',
 *   location: 'Remote',
 *   page: 1,
 *   limit: 20
 * });
 */
export const fetchJobs = async (params = {}) => {
  try {
    console.log('Fetching jobs with params:', params);
    
    const response = await jobAPI.get('/', {
      params: {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...params, // Override defaults with provided params
      },
    });
    
    console.log('Successfully fetched jobs:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    
    const errorMessage = error.response?.data?.message || 'Failed to fetch jobs';
    const statusCode = error.response?.status;
    
    throw new JobServiceError(errorMessage, statusCode, error);
  }
};

/**
 * Creates a new job posting
 * 
 * @param {Object} jobData - Job data to create
 * @param {string} jobData.title - Job title (required)
 * @param {string} jobData.description - Job description (required)
 * @param {string} jobData.company - Company name (required)
 * @param {string} jobData.location - Job location (required)
 * @param {string} jobData.type - Job type (full-time, part-time, contract, etc.)
 * @param {number} [jobData.salary] - Salary amount
 * @param {string} [jobData.salaryType] - Salary type (hourly, annual, etc.)
 * @param {Array<string>} [jobData.requirements] - Job requirements
 * @param {Array<string>} [jobData.benefits] - Job benefits
 * @param {Date} [jobData.deadline] - Application deadline
 * 
 * @returns {Promise<Object>} Promise that resolves to created job data
 * @throws {JobServiceError} When validation fails or API call fails
 * 
 * @example
 * const newJob = await createJob({
 *   title: 'Senior Developer',
 *   description: 'We are looking for...',
 *   company: 'Tech Corp',
 *   location: 'Remote',
 *   type: 'full-time',
 *   salary: 80000,
 *   salaryType: 'annual'
 * });
 */
export const createJob = async (jobData) => {
  try {
    // Validate required fields
    const requiredFields = ['title', 'description', 'company', 'location'];
    const missingFields = requiredFields.filter(field => !jobData[field]);
    
    if (missingFields.length > 0) {
      throw new JobServiceError(
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }
    
    console.log('Creating job with data:', jobData);
    
    const response = await jobAPI.post('/', jobData);
    
    console.log('Successfully created job:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    
    if (error instanceof JobServiceError) {
      throw error; // Re-throw validation errors
    }
    
    const errorMessage = error.response?.data?.message || 'Failed to create job';
    const statusCode = error.response?.status;
    
    throw new JobServiceError(errorMessage, statusCode, error);
  }
};

/**
 * Updates an existing job by ID
 * 
 * @param {string|number} jobId - ID of the job to update
 * @param {Object} updateData - Data to update (partial job object)
 * @param {string} [updateData.title] - Updated job title
 * @param {string} [updateData.description] - Updated job description
 * @param {string} [updateData.location] - Updated job location
 * @param {string} [updateData.type] - Updated job type
 * @param {number} [updateData.salary] - Updated salary
 * 
 * @returns {Promise<Object>} Promise that resolves to updated job data
 * @throws {JobServiceError} When job not found or API call fails
 * 
 * @example
 * const updatedJob = await updateJob(123, {
 *   title: 'Updated Job Title',
 *   salary: 90000
 * });
 */
export const updateJob = async (jobId, updateData) => {
  try {
    if (!jobId) {
      throw new JobServiceError('Job ID is required for update');
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new JobServiceError('Update data is required');
    }
    
    console.log(`Updating job ${jobId} with data:`, updateData);
    
    const response = await jobAPI.put(`/${jobId}`, updateData);
    
    console.log('Successfully updated job:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating job ${jobId}:`, error);
    
    if (error instanceof JobServiceError) {
      throw error; // Re-throw validation errors
    }
    
    const errorMessage = error.response?.data?.message || 'Failed to update job';
    const statusCode = error.response?.status;
    
    throw new JobServiceError(errorMessage, statusCode, error);
  }
};

/**
 * Deletes a job by ID
 * 
 * @param {string|number} jobId - ID of the job to delete
 * 
 * @returns {Promise<Object>} Promise that resolves to deletion confirmation
 * @throws {JobServiceError} When job not found or API call fails
 * 
 * @example
 * await deleteJob(123);
 * console.log('Job deleted successfully');
 */
export const deleteJob = async (jobId) => {
  try {
    if (!jobId) {
      throw new JobServiceError('Job ID is required for deletion');
    }
    
    console.log(`Deleting job ${jobId}`);
    
    const response = await jobAPI.delete(`/${jobId}`);
    
    console.log('Successfully deleted job:', jobId);
    return response.data;
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error);
    
    if (error instanceof JobServiceError) {
      throw error; // Re-throw validation errors
    }
    
    const errorMessage = error.response?.data?.message || 'Failed to delete job';
    const statusCode = error.response?.status;
    
    throw new JobServiceError(errorMessage, statusCode, error);
  }
};

/**
 * Fetches a single job by ID with full details
 * 
 * @param {string|number} jobId - ID of the job to fetch
 * 
 * @returns {Promise<Object>} Promise that resolves to job data
 * @throws {JobServiceError} When job not found or API call fails
 * 
 * @example
 * const job = await getJobById(123);
 * console.log('Job details:', job);
 */
export const getJobById = async (jobId) => {
  try {
    if (!jobId) {
      throw new JobServiceError('Job ID is required');
    }
    
    console.log(`Fetching job details for ID: ${jobId}`);
    
    const response = await jobAPI.get(`/${jobId}`);
    
    console.log('Successfully fetched job details:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    
    if (error instanceof JobServiceError) {
      throw error; // Re-throw validation errors
    }
    
    const errorMessage = error.response?.data?.message || 'Failed to fetch job details';
    const statusCode = error.response?.status;
    
    throw new JobServiceError(errorMessage, statusCode, error);
  }
};

/**
 * Utility function to check if user can edit a job
 * This would typically check user permissions/ownership
 * 
 * @param {Object} job - Job object
 * @param {string} userId - Current user ID
 * @returns {boolean} Whether user can edit the job
 */
export const canEditJob = (job, userId) => {
  return job.createdBy === userId || job.permissions?.includes('edit');
};

/**
 * Utility function to format job data for display
 * 
 * @param {Object} job - Raw job data from API
 * @returns {Object} Formatted job data
 */
export const formatJobData = (job) => {
  return {
    ...job,
    formattedSalary: job.salary ? `$${job.salary.toLocaleString()}` : 'Not specified',
    formattedDate: new Date(job.createdAt).toLocaleDateString(),
    isExpired: job.deadline && new Date(job.deadline) < new Date(),
  };
};

// Export the configured axios instance for advanced usage
export { jobAPI };

// Export the custom error class
export { JobServiceError };