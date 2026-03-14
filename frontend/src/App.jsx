import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';

// Component imports
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import JobList from './components/JobList';
import JobForm from './components/JobForm';
import JobDetail from './components/JobDetail';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import NotFound from './components/NotFound';

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Main App Component
function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load jobs from localStorage on mount
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('jinderJobs');
      if (savedJobs) {
        setJobs(JSON.parse(savedJobs));
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs');
      setLoading(false);
    }
  }, []);

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    try {
      localStorage.setItem('jinderJobs', JSON.stringify(jobs));
    } catch (err) {
      console.error('Error saving jobs:', err);
      setError('Failed to save jobs');
    }
  }, [jobs]);

  // Job management functions
  const addJob = (jobData) => {
    try {
      const newJob = {
        id: Date.now().toString(),
        ...jobData,
        status: jobData.status || 'applied',
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      setJobs(prevJobs => [...prevJobs, newJob]);
      return newJob;
    } catch (err) {
      console.error('Error adding job:', err);
      setError('Failed to add job');
      throw err;
    }
  };

  const updateJob = (jobId, updates) => {
    try {
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, ...updates, lastUpdated: new Date().toISOString() }
            : job
        )
      );
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job');
      throw err;
    }
  };

  const deleteJob = (jobId) => {
    try {
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job');
      throw err;
    }
  };

  const updateJobStatus = (jobId, newStatus) => {
    try {
      updateJob(jobId, { status: newStatus });
    } catch (err) {
      console.error('Error updating job status:', err);
      throw err;
    }
  };

  // Clear error function
  const clearError = () => setError(null);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading JINDER...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        setError(null);
        window.location.reload();
      }}
    >
      <Router>
        <div className="App">
          <Header />
          
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={clearError}>×</button>
            </div>
          )}

          <main className="main-content">
            <Routes>
              {/* Dashboard Route */}
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    jobs={jobs}
                    onStatusUpdate={updateJobStatus}
                    onDeleteJob={deleteJob}
                  />
                } 
              />
              
              {/* Job List Route */}
              <Route 
                path="/jobs" 
                element={
                  <JobList 
                    jobs={jobs}
                    onStatusUpdate={updateJobStatus}
                    onDeleteJob={deleteJob}
                    onEditJob={updateJob}
                  />
                } 
              />
              
              {/* Add Job Route */}
              <Route 
                path="/jobs/new" 
                element={
                  <JobForm 
                    onSubmit={addJob}
                    onCancel={() => window.history.back()}
                  />
                } 
              />
              
              {/* Job Detail Route */}
              <Route 
                path="/jobs/:id" 
                element={
                  <JobDetail 
                    jobs={jobs}
                    onStatusUpdate={updateJobStatus}
                    onDeleteJob={deleteJob}
                    onUpdateJob={updateJob}
                  />
                } 
              />
              
              {/* Edit Job Route */}
              <Route 
                path="/jobs/:id/edit" 
                element={
                  <JobForm 
                    jobs={jobs}
                    onSubmit={updateJob}
                    onCancel={() => window.history.back()}
                    editMode={true}
                  />
                } 
              />
              
              {/* Analytics Route */}
              <Route 
                path="/analytics" 
                element={<Analytics jobs={jobs} />} 
              />
              
              {/* Settings Route */}
              <Route 
                path="/settings" 
                element={<Settings />} 
              />
              
              {/* Redirect old routes */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;