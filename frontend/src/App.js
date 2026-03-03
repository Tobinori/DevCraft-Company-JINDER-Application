import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AddJobForm from './components/AddJobForm';
import JobList from './components/JobList';
import './App.css';

// Global State Context
const JobContext = createContext();

// Custom hook to use job context
export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>🚨 Something went wrong!</h2>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error Details</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <p>{this.state.errorInfo.componentStack}</p>
            </details>
            <button 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Job Provider Component for Global State Management
const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([
    // Sample data for demo
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      description: 'We are looking for an experienced React developer to join our team.',
      requirements: ['React', 'JavaScript', 'Node.js', 'GraphQL'],
      type: 'Full-time',
      remote: true,
      datePosted: new Date().toISOString(),
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: 'Frontend Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      salary: '$90,000 - $120,000',
      description: 'Join our dynamic team building the next generation of web applications.',
      requirements: ['Vue.js', 'TypeScript', 'CSS3', 'REST APIs'],
      type: 'Full-time',
      remote: false,
      datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    remote: null,
    salaryRange: ''
  });

  // Add new job
  const addJob = async (jobData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newJob = {
        ...jobData,
        id: Date.now(),
        datePosted: new Date().toISOString(),
        applicationDeadline: jobData.applicationDeadline || 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setJobs(prevJobs => [newJob, ...prevJobs]);
      return newJob;
    } catch (err) {
      setError('Failed to add job. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update job
  const updateJob = async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === id ? { ...job, ...updates } : job
        )
      );
    } catch (err) {
      setError('Failed to update job. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete job
  const deleteJob = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
    } catch (err) {
      setError('Failed to delete job. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on current filters
  const getFilteredJobs = () => {
    return jobs.filter(job => {
      const matchesSearch = !filters.search || 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesLocation = !filters.location || 
        job.location.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesType = !filters.type || job.type === filters.type;
      
      const matchesRemote = filters.remote === null || job.remote === filters.remote;
      
      return matchesSearch && matchesLocation && matchesType && matchesRemote;
    });
  };

  const contextValue = {
    jobs,
    filteredJobs: getFilteredJobs(),
    loading,
    error,
    filters,
    setFilters,
    addJob,
    updateJob,
    deleteJob,
    clearError: () => setError(null)
  };

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
};

// Navigation Component
const Navigation = () => {
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <h1>🎯 JINDER</h1>
          <span className="nav-subtitle">Job Board Platform</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Browse Jobs</Link>
          <Link to="/post-job" className="nav-link">Post a Job</Link>
        </div>
      </div>
    </nav>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { filteredJobs, loading, error } = useJobContext();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Available Positions</h2>
        <div className="job-stats">
          <span className="stat">
            📊 {filteredJobs.length} jobs available
          </span>
        </div>
      </div>
      
      {error && (
        <div className="error-alert">
          ⚠️ {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : (
        <JobList />
      )}
    </div>
  );
};

// Post Job Page Component
const PostJobPage = () => {
  return (
    <div className="post-job-page">
      <div className="page-header">
        <h2>Post a New Job</h2>
        <p>Fill out the form below to post your job listing</p>
      </div>
      <AddJobForm />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <JobProvider>
        <Router>
          <div className="app">
            <Navigation />
            
            <main className="main-content">
              <div className="container">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/post-job" element={<PostJobPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
            
            <footer className="app-footer">
              <div className="container">
                <p>&copy; 2024 JINDER - Connecting talent with opportunities</p>
              </div>
            </footer>
          </div>
        </Router>
      </JobProvider>
    </ErrorBoundary>
  );
}

export default App;