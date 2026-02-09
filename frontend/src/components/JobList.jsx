import React, { useState, useEffect } from 'react';
import './JobList.css';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return 'status-badge status-applied';
      case 'interview':
        return 'status-badge status-interview';
      case 'offer':
        return 'status-badge status-offer';
      case 'rejected':
        return 'status-badge status-rejected';
      default:
        return 'status-badge status-pending';
    }
  };

  if (loading) {
    return (
      <div className="job-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-list-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={fetchJobs}
          >
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
        <div className="jobs-count">
          {jobs.length} {jobs.length === 1 ? 'application' : 'applications'}
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>No Jobs Found</h3>
          <p>You haven't applied to any jobs yet. Start your job search!</p>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <div className="job-title-section">
                  <h3 className="job-title">{job.title || 'Untitled Position'}</h3>
                  <p className="job-company">{job.company || 'Unknown Company'}</p>
                </div>
                <div className={getStatusBadgeClass(job.status)}>
                  {job.status || 'Pending'}
                </div>
              </div>

              <div className="job-card-body">
                {job.location && (
                  <div className="job-detail">
                    <span className="detail-label">📍 Location:</span>
                    <span className="detail-value">{job.location}</span>
                  </div>
                )}
                
                {job.salary && (
                  <div className="job-detail">
                    <span className="detail-label">💰 Salary:</span>
                    <span className="detail-value">{job.salary}</span>
                  </div>
                )}

                <div className="job-detail">
                  <span className="detail-label">📅 Applied:</span>
                  <span className="detail-value">
                    {job.applicationDate ? formatDate(job.applicationDate) : 'Date not available'}
                  </span>
                </div>

                {job.notes && (
                  <div className="job-notes">
                    <span className="detail-label">📝 Notes:</span>
                    <p className="notes-text">{job.notes}</p>
                  </div>
                )}
              </div>

              <div className="job-card-footer">
                <button className="view-details-btn">
                  View Details
                </button>
                {job.applicationUrl && (
                  <a 
                    href={job.applicationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="external-link-btn"
                  >
                    View Application ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;