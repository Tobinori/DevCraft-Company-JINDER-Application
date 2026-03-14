import React, { useState, useEffect } from 'react';
import { getAllJobs, deleteJob } from '../services/jobsAPI';
import './JobList.css';

const JobList = ({ onEditJob, onViewJob, refreshTrigger }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    loadJobs();
  }, [refreshTrigger]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllJobs();
      setJobs(response.data || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load job applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      setDeleteLoading(jobId);
      await deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job application. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'offer':
        return 'status-badge status-offer';
      case 'interview':
      case 'interviewing':
        return 'status-badge status-interview';
      case 'applied':
      case 'pending':
        return 'status-badge status-applied';
      case 'rejected':
      case 'declined':
        return 'status-badge status-rejected';
      default:
        return 'status-badge status-default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `From ${formatter.format(min)}`;
    } else {
      return `Up to ${formatter.format(max)}`;
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'No notes available';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading) {
    return (
      <div className="job-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading job applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-list-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={loadJobs}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="job-list-container">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No job applications yet</h3>
          <p>Start tracking your job applications by adding your first one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-list-container">
      <div className="job-grid">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-card-header">
              <div className="job-title-company">
                <h3 className="job-title">{job.title || 'Untitled Position'}</h3>
                <p className="job-company">{job.company || 'Unknown Company'}</p>
              </div>
              <span className={getStatusBadgeClass(job.status)}>
                {job.status || 'Unknown'}
              </span>
            </div>

            <div className="job-card-body">
              <div className="job-details">
                <div className="detail-item">
                  <span className="detail-label">Applied:</span>
                  <span className="detail-value">{formatDate(job.applicationDate || job.createdAt)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Salary:</span>
                  <span className="detail-value salary">
                    {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                  </span>
                </div>

                {job.location && (
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{job.location}</span>
                  </div>
                )}
              </div>

              <div className="job-notes">
                <p className="notes-preview">{truncateText(job.notes)}</p>
              </div>
            </div>

            <div className="job-card-actions">
              <button
                className="action-button edit-button"
                onClick={() => onEditJob?.(job)}
                disabled={deleteLoading === job.id}
              >
                <span className="button-icon">✏️</span>
                Edit
              </button>
              
              <button
                className="action-button view-button"
                onClick={() => onViewJob?.(job)}
                disabled={deleteLoading === job.id}
              >
                <span className="button-icon">👁️</span>
                View
              </button>
              
              <button
                className="action-button delete-button"
                onClick={() => handleDelete(job.id)}
                disabled={deleteLoading === job.id}
              >
                {deleteLoading === job.id ? (
                  <>
                    <span className="button-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="button-icon">🗑️</span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;