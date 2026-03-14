import React, { useState, useEffect } from 'react';
import './JobList.css';

const JobList = ({ jobs = [], loading = false, onEdit, onDelete, onRefresh }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Applied': 'status-applied',
      'Interview': 'status-interview', 
      'Offer': 'status-offer',
      'Rejected': 'status-rejected'
    };
    return `status-badge ${statusMap[status] || 'status-default'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = (job) => {
    if (onEdit) {
      onEdit(job);
    }
  };

  const handleDelete = (jobId) => {
    if (onDelete) {
      if (window.confirm('Are you sure you want to delete this job application?')) {
        onDelete(jobId);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="job-list-container">
        <div className="job-list-header">
          <h2>Job Applications</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading job applications...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!jobs || jobs.length === 0) {
    return (
      <div className="job-list-container">
        <div className="job-list-header">
          <h2>Job Applications</h2>
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button 
              className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
            >
              Cards
            </button>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No job applications yet</h3>
          <p>Start tracking your job applications by adding your first application.</p>
          <button className="add-job-btn" onClick={onRefresh}>
            Add Job Application
          </button>
        </div>
      </div>
    );
  }

  // Table view
  const renderTableView = () => (
    <div className="table-container">
      <table className="job-table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Company</th>
            <th>Status</th>
            <th>Application Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="job-row">
              <td className="job-title">{job.title}</td>
              <td className="company-name">{job.company}</td>
              <td>
                <span className={getStatusBadgeClass(job.status)}>
                  {job.status}
                </span>
              </td>
              <td className="application-date">
                {formatDate(job.applicationDate)}
              </td>
              <td className="actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(job)}
                  title="Edit job application"
                >
                  ✏️
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(job.id)}
                  title="Delete job application"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Card view
  const renderCardView = () => (
    <div className="cards-container">
      {jobs.map((job) => (
        <div key={job.id} className="job-card">
          <div className="card-header">
            <h3 className="job-title">{job.title}</h3>
            <span className={getStatusBadgeClass(job.status)}>
              {job.status}
            </span>
          </div>
          <div className="card-body">
            <p className="company-name">
              <strong>Company:</strong> {job.company}
            </p>
            <p className="application-date">
              <strong>Applied:</strong> {formatDate(job.applicationDate)}
            </p>
            {job.location && (
              <p className="job-location">
                <strong>Location:</strong> {job.location}
              </p>
            )}
            {job.salary && (
              <p className="job-salary">
                <strong>Salary:</strong> {job.salary}
              </p>
            )}
          </div>
          <div className="card-actions">
            <button 
              className="edit-btn"
              onClick={() => handleEdit(job)}
            >
              Edit
            </button>
            <button 
              className="delete-btn"
              onClick={() => handleDelete(job.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h2>Job Applications ({jobs.length})</h2>
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
          <button 
            className={`view-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
          >
            Cards
          </button>
        </div>
      </div>
      
      <div className="job-list-content">
        {viewMode === 'table' ? renderTableView() : renderCardView()}
      </div>
    </div>
  );
};

export default JobList;