import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService.js';
import './JobTracker.css';

const JobTracker = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState({
    create: false,
    update: false,
    delete: false
  });
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    status: 'applied',
    dateApplied: '',
    notes: ''
  });
  const [editingJob, setEditingJob] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch jobs on component mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedJobs = await apiService.fetchJobs();
        setJobs(fetchedJobs);
      } catch (err) {
        setError('Failed to load jobs. Please try again.');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Handle adding a new job
  const handleAddJob = async (e) => {
    e.preventDefault();
    
    if (!newJob.title.trim() || !newJob.company.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setOperationLoading(prev => ({ ...prev, create: true }));
      setError(null);
      
      const jobData = {
        ...newJob,
        dateApplied: newJob.dateApplied || new Date().toISOString().split('T')[0]
      };
      
      const createdJob = await apiService.createJob(jobData);
      setJobs(prevJobs => [...prevJobs, createdJob]);
      
      // Reset form
      setNewJob({
        title: '',
        company: '',
        status: 'applied',
        dateApplied: '',
        notes: ''
      });
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to create job. Please try again.');
      console.error('Error creating job:', err);
    } finally {
      setOperationLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle updating a job
  const handleUpdateJob = async (jobId, updatedData) => {
    try {
      setOperationLoading(prev => ({ ...prev, update: true }));
      setError(null);
      
      const updatedJob = await apiService.updateJob(jobId, updatedData);
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? updatedJob : job
        )
      );
      setEditingJob(null);
    } catch (err) {
      setError('Failed to update job. Please try again.');
      console.error('Error updating job:', err);
    } finally {
      setOperationLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Handle deleting a job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      setOperationLoading(prev => ({ ...prev, delete: true }));
      setError(null);
      
      await apiService.deleteJob(jobId);
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (err) {
      setError('Failed to delete job. Please try again.');
      console.error('Error deleting job:', err);
    } finally {
      setOperationLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Handle editing a job
  const handleEditJob = (job) => {
    setEditingJob({ ...job });
  };

  // Handle saving edited job
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!editingJob.title.trim() || !editingJob.company.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    await handleUpdateJob(editingJob.id, editingJob);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingJob(null);
  };

  // Handle status change
  const handleStatusChange = async (jobId, newStatus) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      await handleUpdateJob(jobId, { ...job, status: newStatus });
    }
  };

  // Get status color class
  const getStatusColor = (status) => {
    const colors = {
      'applied': 'status-applied',
      'interviewing': 'status-interviewing',
      'offered': 'status-offered',
      'rejected': 'status-rejected',
      'accepted': 'status-accepted'
    };
    return colors[status] || 'status-default';
  };

  if (loading) {
    return (
      <div className="job-tracker">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-tracker">
      <div className="job-tracker-header">
        <h1>Job Application Tracker</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={operationLoading.create}
        >
          {showAddForm ? 'Cancel' : 'Add New Job'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button 
            className="btn btn-link"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="job-form">
          <h3>Add New Job Application</h3>
          <form onSubmit={handleAddJob}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="jobTitle">Job Title *</label>
                <input
                  id="jobTitle"
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                  disabled={operationLoading.create}
                />
              </div>
              <div className="form-group">
                <label htmlFor="company">Company *</label>
                <input
                  id="company"
                  type="text"
                  value={newJob.company}
                  onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  placeholder="e.g. TechCorp Inc."
                  required
                  disabled={operationLoading.create}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={newJob.status}
                  onChange={(e) => setNewJob({...newJob, status: e.target.value})}
                  disabled={operationLoading.create}
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dateApplied">Date Applied</label>
                <input
                  id="dateApplied"
                  type="date"
                  value={newJob.dateApplied}
                  onChange={(e) => setNewJob({...newJob, dateApplied: e.target.value})}
                  disabled={operationLoading.create}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={newJob.notes}
                onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
                placeholder="Additional notes about this application..."
                rows="3"
                disabled={operationLoading.create}
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={operationLoading.create}
              >
                {operationLoading.create ? (
                  <>
                    <span className="spinner-small"></span>
                    Adding...
                  </>
                ) : (
                  'Add Job'
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
                disabled={operationLoading.create}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="jobs-summary">
        <div className="summary-stat">
          <span className="stat-number">{jobs.length}</span>
          <span className="stat-label">Total Applications</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">{jobs.filter(job => job.status === 'interviewing').length}</span>
          <span className="stat-label">Interviewing</span>
        </div>
        <div className="summary-stat">
          <span className="stat-number">{jobs.filter(job => job.status === 'offered').length}</span>
          <span className="stat-label">Offers</span>
        </div>
      </div>

      <div className="jobs-list">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>No job applications yet.</p>
            <p>Start tracking your job search by adding your first application!</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="job-card">
              {editingJob && editingJob.id === job.id ? (
                <form onSubmit={handleSaveEdit} className="edit-form">
                  <div className="form-row">
                    <input
                      type="text"
                      value={editingJob.title}
                      onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                      placeholder="Job Title"
                      required
                      disabled={operationLoading.update}
                    />
                    <input
                      type="text"
                      value={editingJob.company}
                      onChange={(e) => setEditingJob({...editingJob, company: e.target.value})}
                      placeholder="Company"
                      required
                      disabled={operationLoading.update}
                    />
                  </div>
                  <div className="form-row">
                    <select
                      value={editingJob.status}
                      onChange={(e) => setEditingJob({...editingJob, status: e.target.value})}
                      disabled={operationLoading.update}
                    >
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </select>
                    <input
                      type="date"
                      value={editingJob.dateApplied}
                      onChange={(e) => setEditingJob({...editingJob, dateApplied: e.target.value})}
                      disabled={operationLoading.update}
                    />
                  </div>
                  <textarea
                    value={editingJob.notes}
                    onChange={(e) => setEditingJob({...editingJob, notes: e.target.value})}
                    placeholder="Notes"
                    rows="2"
                    disabled={operationLoading.update}
                  />
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-sm btn-primary"
                      disabled={operationLoading.update}
                    >
                      {operationLoading.update ? (
                        <>
                          <span className="spinner-small"></span>
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={operationLoading.update}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="job-header">
                    <div className="job-title-company">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-company">{job.company}</p>
                    </div>
                    <div className={`job-status ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="job-details">
                    <div className="job-meta">
                      <span className="job-date">
                        Applied: {new Date(job.dateApplied).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {job.notes && (
                      <div className="job-notes">
                        <p>{job.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="job-actions">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      className="status-select"
                      disabled={operationLoading.update}
                    >
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </select>
                    
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleEditJob(job)}
                      disabled={operationLoading.update || operationLoading.delete}
                    >
                      Edit
                    </button>
                    
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={operationLoading.delete || operationLoading.update}
                    >
                      {operationLoading.delete ? (
                        <>
                          <span className="spinner-small"></span>
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobTracker;