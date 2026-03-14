import React, { useState } from 'react';
import JobForm from './JobForm';
import JobList from './JobList';
import './JobTracker.css';

const JobTracker = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      company: 'Example Corp',
      position: 'Software Developer',
      status: 'Applied',
      dateApplied: '2024-01-15',
      notes: 'Initial application submitted'
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Add new job
  const handleAddJob = (jobData) => {
    const newJob = {
      ...jobData,
      id: Date.now(), // Simple ID generation
      dateApplied: jobData.dateApplied || new Date().toISOString().split('T')[0]
    };
    setJobs(prevJobs => [...prevJobs, newJob]);
    setShowForm(false);
  };

  // Update existing job
  const handleUpdateJob = (updatedJob) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    );
    setEditingJob(null);
    setShowForm(false);
  };

  // Delete job
  const handleDeleteJob = (jobId) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  };

  // Start editing a job
  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setEditingJob(null); // Clear editing state when hiding form
    }
  };

  // Cancel form (hide and clear editing state)
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  return (
    <div className="job-tracker">
      <header className="job-tracker__header">
        <h1 className="job-tracker__title">Job Application Tracker</h1>
        <button 
          className={`job-tracker__toggle-btn ${showForm ? 'active' : ''}`}
          onClick={toggleForm}
        >
          {showForm ? 'Cancel' : 'Add New Job'}
        </button>
      </header>

      <div className="job-tracker__content">
        {showForm && (
          <div className="job-tracker__form-section">
            <JobForm
              onSubmit={editingJob ? handleUpdateJob : handleAddJob}
              onCancel={handleCancelForm}
              initialData={editingJob}
              isEditing={!!editingJob}
            />
          </div>
        )}

        <div className="job-tracker__list-section">
          <JobList
            jobs={jobs}
            onEdit={handleEditJob}
            onDelete={handleDeleteJob}
          />
        </div>
      </div>

      {jobs.length === 0 && !showForm && (
        <div className="job-tracker__empty-state">
          <p>No job applications tracked yet.</p>
          <button 
            className="job-tracker__empty-btn"
            onClick={toggleForm}
          >
            Add Your First Job Application
          </button>
        </div>
      )}
    </div>
  );
};

export default JobTracker;