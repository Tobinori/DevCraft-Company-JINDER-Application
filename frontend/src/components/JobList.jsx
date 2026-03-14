import React from 'react';
import './JobList.css';

const JobList = ({ jobs = [], onEdit, onDelete }) => {
  // Handle empty state
  if (!jobs || jobs.length === 0) {
    return (
      <div className="job-list-container">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No jobs found</h3>
          <p className="empty-state-message">
            You haven't added any job applications yet. Start by adding your first job application!
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'applied': 'status-applied',
      'interviewing': 'status-interviewing',
      'offered': 'status-offered',
      'rejected': 'status-rejected',
      'withdrawn': 'status-withdrawn'
    };
    return statusMap[status?.toLowerCase()] || 'status-default';
  };

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h2 className="job-list-title">Job Applications ({jobs.length})</h2>
      </div>
      
      <div className="job-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-card-header">
              <div className="job-info">
                <h3 className="job-position">{job.position || 'Position not specified'}</h3>
                <p className="job-company">{job.company || 'Company not specified'}</p>
              </div>
              <div className="job-status">
                <span className={`status-badge ${getStatusClass(job.status)}`}>
                  {job.status || 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="job-card-body">
              <div className="job-details">
                <div className="job-detail-item">
                  <span className="detail-label">Date Applied:</span>
                  <span className="detail-value">{formatDate(job.dateApplied)}</span>
                </div>
                {job.location && (
                  <div className="job-detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{job.location}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="job-detail-item">
                    <span className="detail-label">Salary:</span>
                    <span className="detail-value">{job.salary}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="job-card-actions">
              <button
                className="action-btn edit-btn"
                onClick={() => onEdit && onEdit(job)}
                aria-label={`Edit ${job.position} at ${job.company}`}
              >
                <span className="btn-icon">✏️</span>
                Edit
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => onDelete && onDelete(job)}
                aria-label={`Delete ${job.position} at ${job.company}`}
              >
                <span className="btn-icon">🗑️</span>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;