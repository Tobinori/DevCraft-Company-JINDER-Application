import axios from 'axios';

// Base URL configuration - can be overridden by environment variables
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
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
          // Unauthorized - clear auth token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden:', data.message || 'Insufficient permissions');
          break;
        case 404:
          console.error('Resource not found:', data.message || 'The requested resource was not found');
          break;
        case 500:
          console.error('Server error:', data.message || 'Internal server error');
          break;
        default:
          console.error('API Error:', data.message || `HTTP ${status} error`);
      }
      
      // Return a formatted error object
      return Promise.reject({
        status,
        message: data.message || `HTTP ${status} error`,
        data: data,
      });
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
        data: null,
      });
    } else {
      // Other error
      console.error('Request error:', error.message);
      return Promise.reject({
        status: -1,
        message: error.message,
        data: null,
      });
    }
  }
);

// API Functions

/**
 * Fetch all jobs
 * @param {Object} params - Query parameters (optional)
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of items per page
 * @param {string} params.search - Search term
 * @param {string} params.status - Filter by job status
 * @returns {Promise<Object>} Jobs data with pagination info
 */
export const fetchJobs = async (params = {}) => {
  try {
    const response = await apiClient.get('/jobs', { params });
    return {
      success: true,
      data: response.data,
      message: 'Jobs fetched successfully',
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to fetch jobs',
      error,
    };
  }
};

/**
 * Create a new job
 * @param {Object} jobData - Job data object
 * @param {string} jobData.title - Job title
 * @param {string} jobData.company - Company name
 * @param {string} jobData.description - Job description
 * @param {string} jobData.location - Job location
 * @param {string} jobData.salary - Salary information
 * @param {Array} jobData.requirements - Job requirements
 * @param {string} jobData.status - Job status (open, closed, etc.)
 * @returns {Promise<Object>} Created job data
 */
export const createJob = async (jobData) => {
  try {
    // Validate required fields
    if (!jobData.title || !jobData.company) {
      throw new Error('Title and company are required fields');
    }

    const response = await apiClient.post('/jobs', jobData);
    return {
      success: true,
      data: response.data,
      message: 'Job created successfully',
    };
  } catch (error) {
    console.error('Error creating job:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to create job',
      error,
    };
  }
};

/**
 * Update an existing job
 * @param {string|number} id - Job ID
 * @param {Object} jobData - Updated job data
 * @returns {Promise<Object>} Updated job data
 */
export const updateJob = async (id, jobData) => {
  try {
    if (!id) {
      throw new Error('Job ID is required for update');
    }

    const response = await apiClient.put(`/jobs/${id}`, jobData);
    return {
      success: true,
      data: response.data,
      message: 'Job updated successfully',
    };
  } catch (error) {
    console.error('Error updating job:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to update job',
      error,
    };
  }
};

/**
 * Delete a job
 * @param {string|number} id - Job ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteJob = async (id) => {
  try {
    if (!id) {
      throw new Error('Job ID is required for deletion');
    }

    const response = await apiClient.delete(`/jobs/${id}`);
    return {
      success: true,
      data: response.data,
      message: 'Job deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting job:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to delete job',
      error,
    };
  }
};

/**
 * Fetch a single job by ID
 * @param {string|number} id - Job ID
 * @returns {Promise<Object>} Job data
 */
export const fetchJobById = async (id) => {
  try {
    if (!id) {
      throw new Error('Job ID is required');
    }

    const response = await apiClient.get(`/jobs/${id}`);
    return {
      success: true,
      data: response.data,
      message: 'Job fetched successfully',
    };
  } catch (error) {
    console.error('Error fetching job:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to fetch job',
      error,
    };
  }
};

// Export the configured axios instance for custom requests
export { apiClient };

// Export base URL for reference
export { BASE_URL };

// Default export with all API functions
export default {
  fetchJobs,
  createJob,
  updateJob,
  deleteJob,
  fetchJobById,
  apiClient,
  BASE_URL,
};