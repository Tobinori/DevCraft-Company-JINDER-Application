import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import JobList from './components/JobList';
import JobForm from './components/JobForm';
import Navigation from './components/Navigation';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load jobs from localStorage on component mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('jinder-jobs');
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs));
      } catch (err) {
        console.error('Error parsing saved jobs:', err);
        setError('Failed to load saved jobs');
      }
    }
  }, []);

  // Save jobs to localStorage whenever jobs array changes
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem('jinder-jobs', JSON.stringify(jobs));
    }
  }, [jobs]);

  // Add new job
  const addJob = (jobData) => {
    try {
      setLoading(true);
      const newJob = {
        id: Date.now().toString(), // Simple ID generation
        ...jobData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'applied' // Default status
      };
      
      setJobs(prevJobs => [...prevJobs, newJob]);
      setError(null);
      return newJob.id;
    } catch (err) {
      console.error('Error adding job:', err);
      setError('Failed to add job');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Edit existing job
  const editJob = (jobId, updatedData) => {
    try {
      setLoading(true);
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { 
                ...job, 
                ...updatedData, 
                updatedAt: new Date().toISOString() 
              }
            : job
        )
      );
      setError(null);
      return true;
    } catch (err) {
      console.error('Error editing job:', err);
      setError('Failed to update job');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete job
  const deleteJob = (jobId) => {
    try {
      setLoading(true);
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get job by ID
  const getJobById = (jobId) => {
    return jobs.find(job => job.id === jobId);
  };

  // Update job status
  const updateJobStatus = (jobId, status) => {
    return editJob(jobId, { status });
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Clear all jobs
  const clearAllJobs = () => {
    if (window.confirm('Are you sure you want to delete all jobs? This action cannot be undone.')) {
      setJobs([]);
      localStorage.removeItem('jinder-jobs');
    }
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>JINDER</h1>
          <p className="app-subtitle">Job Application Tracker</p>
        </header>

        <Navigation jobCount={jobs.length} />

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError} className="error-close">
              ×
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-banner">
            Processing...
          </div>
        )}

        <main className="app-main">
          <Routes>
            {/* Default route - redirect to jobs list */}
            <Route 
              path="/" 
              element={<Navigate to="/jobs" replace />} 
            />
            
            {/* Jobs list view */}
            <Route 
              path="/jobs" 
              element={
                <JobList 
                  jobs={jobs}
                  onEditJob={editJob}
                  onDeleteJob={deleteJob}
                  onUpdateStatus={updateJobStatus}
                  onClearAll={clearAllJobs}
                  loading={loading}
                />
              } 
            />
            
            {/* Add new job form */}
            <Route 
              path="/add" 
              element={
                <JobForm 
                  onSubmit={addJob}
                  onCancel={() => window.history.back()}
                  loading={loading}
                />
              } 
            />
            
            {/* Edit job form */}
            <Route 
              path="/edit/:id" 
              element={
                <JobForm 
                  job={getJobById}
                  onSubmit={editJob}
                  onCancel={() => window.history.back()}
                  loading={loading}
                  isEditing={true}
                />
              } 
            />
            
            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <div className="not-found">
                  <h2>Page Not Found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                  <button onClick={() => window.history.back()}>
                    Go Back
                  </button>
                </div>
              } 
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2024 JINDER - Job Application Tracker</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;