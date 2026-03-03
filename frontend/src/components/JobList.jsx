import React, { useState, useEffect } from 'react';
import './JobList.css';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update job status');
      }
      
      const updatedJob = await response.json();
      setJobs(jobs.map(job => 
        job.id === jobId ? updatedJob : job
      ));
    } catch (err) {
      console.error('Error updating job status:', err);
      alert('Failed to update job status');
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job');
    }
  };

  const getStatusBadgeClass = (status) => {
    const baseClass = 'status-badge';
    switch (status?.toLowerCase()) {
      case 'applied':
        return `${baseClass} status-applied`;
      case 'interviewing':
        return `${baseClass} status-interviewing`;
      case 'offer':
        return `${baseClass} status-offer`;
      case 'rejected':
        return `${baseClass} status-rejected`;
      case 'wishlist':
        return `${baseClass} status-wishlist`;
      default:
        return `${baseClass} status-default`;
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status?.toLowerCase() === filter.toLowerCase();
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="job-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-list-container">
        <div className="error-message">
          <h3>Error loading jobs</h3>
          <p>{error}</p>
          <button onClick={fetchJobs} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h2>Job Applications</h2>
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Jobs ({jobs.length})</option>
            <option value="wishlist">Wishlist</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={fetchJobs} className="btn btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <h3>No jobs found</h3>
          <p>
            {filter === 'all' 
              ? 'Start tracking your job applications by adding a new job.'
              : `No jobs with status "${filter}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="job-grid">
          {filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <div className="job-title-section">
                  <h3 className="job-title">{job.title || 'Unknown Title'}</h3>
                  <p className="company-name">{job.company || 'Unknown Company'}</p>
                </div>
                <span className={getStatusBadgeClass(job.status)}>
                  {job.status || 'Unknown'}
                </span>
              </div>
              
              <div className="job-details">
                {job.location && (
                  <div className="job-detail">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{job.location}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="job-detail">
                    <span className="detail-label">Salary:</span>
                    <span className="detail-value">{job.salary}</span>
                  </div>
                )}
                <div className="job-detail">
                  <span className="detail-label">Applied:</span>
                  <span className="detail-value">{formatDate(job.appliedDate)}</span>
                </div>
                {job.notes && (
                  <div className="job-notes">
                    <span className="detail-label">Notes:</span>
                    <p className="notes-text">{job.notes}</p>
                  </div>
                )}
              </div>

              <div className="job-actions">
                <div className="status-actions">
                  <select 
                    value={job.status || ''} 
                    onChange={(e) => updateJobStatus(job.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="card-buttons">
                  {job.jobUrl && (
                    <a 
                      href={job.jobUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-link"
                    >
                      View Job
                    </a>
                  )}
                  <button 
                    onClick={() => deleteJob(job.id)}
                    className="btn btn-danger"
                    title="Delete job"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;