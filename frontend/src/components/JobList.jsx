import React, { useState } from 'react';
import JobForm from './JobForm';
import './JobList.css';

function JobList() {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      company: 'Tech Corp',
      position: 'Frontend Developer',
      status: 'Applied',
      dateApplied: '2024-01-15',
      notes: 'Submitted application through company website'
    },
    {
      id: 2,
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      status: 'Interview',
      dateApplied: '2024-01-10',
      notes: 'Phone interview scheduled for next week'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const handleAddNew = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleSave = (jobData) => {
    if (editingJob) {
      // Update existing job
      setJobs(jobs.map(job => 
        job.id === editingJob.id ? { ...jobData, id: editingJob.id } : job
      ));
    } else {
      // Add new job
      const newJob = {
        ...jobData,
        id: Date.now() // Simple ID generation
      };
      setJobs([...jobs, newJob]);
    }
    setShowForm(false);
    setEditingJob(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const handleDelete = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      setJobs(jobs.filter(job => job.id !== jobId));
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return '#2196F3';
      case 'interview':
        return '#FF9800';
      case 'offer':
        return '#4CAF50';
      case 'rejected':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  return (
    <div className="job-list">
      <div className="job-list-header">
        <h2>Job Applications</h2>
        <button 
          className="add-job-btn"
          onClick={handleAddNew}
        >
          Add New Job
        </button>
      </div>

      {showForm && (
        <div className="job-form-overlay">
          <div className="job-form-modal">
            <JobForm
              job={editingJob}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No job applications yet.</p>
          <button 
            className="add-first-job-btn"
            onClick={handleAddNew}
          >
            Add Your First Job Application
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3 className="job-position">{job.position}</h3>
                <div className="job-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(job)}
                    title="Edit job"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(job.id)}
                    title="Delete job"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="job-company">{job.company}</div>
              
              <div className="job-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(job.status) }}
                >
                  {job.status}
                </span>
              </div>
              
              <div className="job-date">
                Applied: {new Date(job.dateApplied).toLocaleDateString()}
              </div>
              
              {job.notes && (
                <div className="job-notes">
                  <strong>Notes:</strong> {job.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="job-stats">
        <div className="stat">
          <span className="stat-number">{jobs.length}</span>
          <span className="stat-label">Total Applications</span>
        </div>
        <div className="stat">
          <span className="stat-number">{jobs.filter(j => j.status.toLowerCase() === 'interview').length}</span>
          <span className="stat-label">Interviews</span>
        </div>
        <div className="stat">
          <span className="stat-number">{jobs.filter(j => j.status.toLowerCase() === 'offer').length}</span>
          <span className="stat-label">Offers</span>
        </div>
      </div>
    </div>
  );
}

export default JobList;