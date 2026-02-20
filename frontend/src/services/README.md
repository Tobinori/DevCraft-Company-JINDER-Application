# Services Documentation

This directory contains service modules for making API calls to the JINDER backend. Each service module encapsulates HTTP requests and provides a clean interface for components to interact with the API.

## Job Service

The job service (`jobService.js`) handles all job-related API operations including creating, reading, updating, and deleting job postings.

### Available Functions

#### `createJob(jobData)`
Creates a new job posting.

**Parameters:**
- `jobData` (Object): Job information including title, company, description, etc.

**Returns:** Promise that resolves to the created job object

**Example Usage:**
```javascript
import { createJob } from '../services/jobService';

const handleCreateJob = async () => {
  try {
    const jobData = {
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      description: 'We are looking for an experienced frontend developer...',
      requirements: ['React', 'TypeScript', '3+ years experience'],
      salary: '$120,000 - $150,000',
      type: 'full-time'
    };
    
    const newJob = await createJob(jobData);
    console.log('Job created successfully:', newJob);
    
    // Handle success (e.g., redirect, show success message)
    setSuccessMessage('Job posted successfully!');
    navigate('/jobs');
    
  } catch (error) {
    console.error('Error creating job:', error);
    
    // Handle different error types
    if (error.response?.status === 401) {
      setErrorMessage('Please log in to post a job');
      navigate('/login');
    } else if (error.response?.status === 400) {
      setErrorMessage('Please check your job details and try again');
    } else {
      setErrorMessage('Failed to create job. Please try again later.');
    }
  }
};
```

#### `getAllJobs(filters = {})`
Retrieves all job postings with optional filtering.

**Parameters:**
- `filters` (Object, optional): Filter criteria like location, company, job type, etc.

**Returns:** Promise that resolves to an array of job objects

**Example Usage:**
```javascript
import { getAllJobs } from '../services/jobService';

const JobListComponent = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Optional filters
        const filters = {
          location: 'San Francisco',
          type: 'full-time',
          company: 'Tech Corp'
        };
        
        const jobList = await getAllJobs(filters);
        setJobs(jobList);
        
      } catch (error) {
        console.error('Error fetching jobs:', error);
        
        if (error.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else if (error.code === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection.');
        } else {
          setError('Failed to load jobs. Please refresh the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div>
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};
```

#### `updateJob(jobId, updateData)`
Updates an existing job posting.

**Parameters:**
- `jobId` (string|number): ID of the job to update
- `updateData` (Object): Fields to update

**Returns:** Promise that resolves to the updated job object

**Example Usage:**
```javascript
import { updateJob } from '../services/jobService';

const handleUpdateJob = async (jobId, formData) => {
  try {
    const updateData = {
      title: formData.title,
      description: formData.description,
      salary: formData.salary,
      // Only include fields that have changed
    };
    
    const updatedJob = await updateJob(jobId, updateData);
    console.log('Job updated successfully:', updatedJob);
    
    // Handle success
    setSuccessMessage('Job updated successfully!');
    setIsEditing(false);
    
    // Optionally refresh the job data
    setJob(updatedJob);
    
  } catch (error) {
    console.error('Error updating job:', error);
    
    // Handle different error scenarios
    if (error.response?.status === 404) {
      setErrorMessage('Job not found. It may have been deleted.');
      navigate('/jobs');
    } else if (error.response?.status === 403) {
      setErrorMessage('You are not authorized to edit this job.');
    } else if (error.response?.status === 400) {
      setErrorMessage('Please check your job details and try again.');
    } else {
      setErrorMessage('Failed to update job. Please try again.');
    }
  }
};
```

#### `deleteJob(jobId)`
Deletes a job posting.

**Parameters:**
- `jobId` (string|number): ID of the job to delete

**Returns:** Promise that resolves when deletion is complete

**Example Usage:**
```javascript
import { deleteJob } from '../services/jobService';

const handleDeleteJob = async (jobId) => {
  try {
    // Show confirmation dialog first
    const confirmed = window.confirm('Are you sure you want to delete this job posting?');
    if (!confirmed) return;
    
    await deleteJob(jobId);
    console.log('Job deleted successfully');
    
    // Handle success
    setSuccessMessage('Job deleted successfully!');
    
    // Remove from local state or redirect
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    // OR navigate away
    // navigate('/jobs');
    
  } catch (error) {
    console.error('Error deleting job:', error);
    
    // Handle different error scenarios
    if (error.response?.status === 404) {
      setErrorMessage('Job not found. It may have already been deleted.');
      // Refresh the job list
      window.location.reload();
    } else if (error.response?.status === 403) {
      setErrorMessage('You are not authorized to delete this job.');
    } else {
      setErrorMessage('Failed to delete job. Please try again.');
    }
  }
};
```

## Error Handling Best Practices

### 1. Always Use Try-Catch
Wrap all service calls in try-catch blocks to handle both network errors and API errors.

### 2. Handle Different HTTP Status Codes
```javascript
if (error.response?.status === 401) {
  // Unauthorized - redirect to login
} else if (error.response?.status === 403) {
  // Forbidden - show access denied message
} else if (error.response?.status === 404) {
  // Not found - show appropriate message
} else if (error.response?.status === 500) {
  // Server error - show generic error message
}
```

### 3. Provide User-Friendly Error Messages
Avoid showing technical error messages to users. Instead, provide clear, actionable feedback.

### 4. Handle Loading States
Always manage loading states to provide feedback during API calls:
```javascript
const [loading, setLoading] = useState(false);

setLoading(true);
try {
  await apiCall();
} finally {
  setLoading(false);
}
```

### 5. Network Error Handling
Handle cases where the user has no internet connection:
```javascript
if (error.code === 'NETWORK_ERROR') {
  setError('Please check your internet connection.');
}
```

## Usage with React Hooks

### Custom Hook Example
```javascript
const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllJobs(filters);
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeJob = useCallback(async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      throw err; // Re-throw to handle in component
    }
  }, []);

  return { jobs, loading, error, fetchJobs, removeJob };
};
```

## Testing Service Functions

When testing components that use these services, mock the service functions:

```javascript
// In your test file
jest.mock('../services/jobService', () => ({
  getAllJobs: jest.fn(),
  createJob: jest.fn(),
  updateJob: jest.fn(),
  deleteJob: jest.fn(),
}));

// In your test
it('should handle job creation', async () => {
  const mockJob = { id: 1, title: 'Test Job' };
  createJob.mockResolvedValue(mockJob);
  
  // Test your component...
});
```

## Important Notes

1. **Authentication**: Most job operations require user authentication. Ensure users are logged in before calling these functions.

2. **Validation**: Always validate form data before sending to the API.

3. **Rate Limiting**: Be mindful of API rate limits. Avoid making too many requests in quick succession.

4. **Caching**: Consider implementing caching strategies for frequently accessed data like job listings.

5. **Security**: Never expose sensitive data in error messages or console logs in production.

For more information about the API endpoints and data structures, refer to the backend API documentation.