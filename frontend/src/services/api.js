// API service for job-related operations

// Base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Custom error class for API errors
class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const hasJson = contentType && contentType.includes('application/json');
  const data = hasJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = hasJson && data.message ? data.message : `HTTP ${response.status}: ${response.statusText}`;
    throw new APIError(errorMessage, response.status, data);
  }

  return data;
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    // Handle network errors or other unexpected errors
    throw new APIError('Network error or server unavailable', 0, error.message);
  }
};

// Job API functions
const jobAPI = {
  /**
   * Fetch all jobs with optional query parameters
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise<Object>} Response with jobs array and metadata
   */
  fetchJobs: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/jobs${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiRequest(endpoint, {
        method: 'GET',
      });

      return data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  /**
   * Fetch a single job by ID
   * @param {string|number} id - Job ID
   * @returns {Promise<Object>} Job data
   */
  fetchJobById: async (id) => {
    try {
      if (!id) {
        throw new APIError('Job ID is required', 400);
      }

      const data = await apiRequest(`/jobs/${id}`, {
        method: 'GET',
      });

      return data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new job
   * @param {Object} jobData - Job data to create
   * @returns {Promise<Object>} Created job data
   */
  createJob: async (jobData) => {
    try {
      if (!jobData || typeof jobData !== 'object') {
        throw new APIError('Valid job data is required', 400);
      }

      // Validate required fields
      const requiredFields = ['title', 'company', 'location'];
      const missingFields = requiredFields.filter(field => !jobData[field]);
      
      if (missingFields.length > 0) {
        throw new APIError(`Missing required fields: ${missingFields.join(', ')}`, 400);
      }

      const data = await apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });

      return data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  /**
   * Update an existing job
   * @param {string|number} id - Job ID to update
   * @param {Object} jobData - Updated job data
   * @returns {Promise<Object>} Updated job data
   */
  updateJob: async (id, jobData) => {
    try {
      if (!id) {
        throw new APIError('Job ID is required', 400);
      }

      if (!jobData || typeof jobData !== 'object') {
        throw new APIError('Valid job data is required', 400);
      }

      const data = await apiRequest(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      });

      return data;
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Partially update a job (PATCH)
   * @param {string|number} id - Job ID to update
   * @param {Object} updates - Partial job data updates
   * @returns {Promise<Object>} Updated job data
   */
  patchJob: async (id, updates) => {
    try {
      if (!id) {
        throw new APIError('Job ID is required', 400);
      }

      if (!updates || typeof updates !== 'object') {
        throw new APIError('Valid update data is required', 400);
      }

      const data = await apiRequest(`/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      return data;
    } catch (error) {
      console.error(`Error patching job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a job
   * @param {string|number} id - Job ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteJob: async (id) => {
    try {
      if (!id) {
        throw new APIError('Job ID is required', 400);
      }

      const data = await apiRequest(`/jobs/${id}`, {
        method: 'DELETE',
      });

      return data;
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Batch operations for jobs
   * @param {Array} operations - Array of operations to perform
   * @returns {Promise<Object>} Batch operation results
   */
  batchJobs: async (operations) => {
    try {
      if (!Array.isArray(operations) || operations.length === 0) {
        throw new APIError('Valid operations array is required', 400);
      }

      const data = await apiRequest('/jobs/batch', {
        method: 'POST',
        body: JSON.stringify({ operations }),
      });

      return data;
    } catch (error) {
      console.error('Error performing batch operations:', error);
      throw error;
    }
  },
};

// Export the API functions and error class
export { jobAPI as default, APIError };

// Also export individual functions for convenience
export const {
  fetchJobs,
  fetchJobById,
  createJob,
  updateJob,
  patchJob,
  deleteJob,
  batchJobs,
} = jobAPI;