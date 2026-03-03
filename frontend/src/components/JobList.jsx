import React, { useState, useEffect } from 'react';
import './AddJobForm.css'; // Reuse existing styles

const JobList = ({ onEditJob, onDeleteJob, refreshTrigger }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch jobs from API
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
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle job deletion
  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      setDeleteLoading(jobId);
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      // Remove job from local state
      setJobs(jobs.filter(job => job._id !== jobId));
      
      if (onDeleteJob) {
        onDeleteJob(jobId);
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const baseClass = 'status-badge';
    switch (status?.toLowerCase()) {
      case 'applied':
        return `${baseClass} status-applied`;
      case 'interview':
        return `${baseClass} status-interview`;
      case 'offer':
        return `${baseClass} status-offer`;
      case 'rejected':
        return `${baseClass} status-rejected`;
      default:
        return `${baseClass} status-default`;
    }
  };

  // Fetch jobs on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchJobs();
  }, [refreshTrigger]);

  // Loading state
  if (loading) {
    return (
      <div className="form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your job applications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="form-container">
        <div className="error-container">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={fetchJobs}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="form-container">
        <div className="empty-state">
          <h3>📝 No Job Applications Yet</h3>
          <p>Start tracking your job applications by adding your first one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="job-list-header">
        <h2>Your Job Applications ({jobs.length})</h2>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={fetchJobs}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="job-table-container desktop-only">
        <table className="job-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Application Date</th>
              <th>Salary Range</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id} className="job-row">
                <td className="company-cell">
                  <div className="company-info">
                    <strong>{job.company}</strong>
                    {job.location && (
                      <div className="location">📍 {job.location}</div>
                    )}
                  </div>
                </td>
                <td className="position-cell">
                  <strong>{job.position}</strong>
                  {job.jobType && (
                    <div className="job-type">{job.jobType}</div>
                  )}
                </td>
                <td>
                  <span className={getStatusClass(job.status)}>
                    {job.status || 'Applied'}
                  </span>
                </td>
                <td>{formatDate(job.applicationDate)}</td>
                <td>
                  {job.salaryRange ? (
                    <span className="salary-range">{job.salaryRange}</span>
                  ) : (
                    <span className="text-muted">Not specified</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onEditJob && onEditJob(job)}
                      title="Edit job"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(job._id)}
                      disabled={deleteLoading === job._id}
                      title="Delete job"
                    >
                      {deleteLoading === job._id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="job-cards-container mobile-only">
        {jobs.map((job) => (
          <div key={job._id} className="job-card">
            <div className="job-card-header">
              <div className="job-title-section">
                <h3 className="job-position">{job.position}</h3>
                <p className="job-company">{job.company}</p>
                {job.location && (
                  <p className="job-location">📍 {job.location}</p>
                )}
              </div>
              <span className={getStatusClass(job.status)}>
                {job.status || 'Applied'}
              </span>
            </div>
            
            <div className="job-card-details">
              <div className="detail-row">
                <span className="detail-label">Applied:</span>
                <span className="detail-value">{formatDate(job.applicationDate)}</span>
              </div>
              {job.jobType && (
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{job.jobType}</span>
                </div>
              )}
              {job.salaryRange && (
                <div className="detail-row">
                  <span className="detail-label">Salary:</span>
                  <span className="detail-value">{job.salaryRange}</span>
                </div>
              )}
              {job.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value notes-preview">
                    {job.notes.length > 100 
                      ? `${job.notes.substring(0, 100)}...`
                      : job.notes
                    }
                  </span>
                </div>
              )}
            </div>
            
            <div className="job-card-actions">
              <button
                className="btn btn-primary"
                onClick={() => onEditJob && onEditJob(job)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(job._id)}
                disabled={deleteLoading === job._id}
              >
                {deleteLoading === job._id ? '⏳ Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;