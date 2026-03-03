import React, { useState, useEffect } from 'react';
import styles from './JobList.module.css';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/jobs`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      setDeleteLoading(jobId);
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove job from local state
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      alert('Error deleting job: ' + err.message);
      console.error('Error deleting job:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (jobId) => {
    // For demo purposes, we'll just log the action
    // In a real app, this would navigate to an edit form
    console.log('Edit job:', jobId);
    alert(`Edit functionality for job ${jobId} - would navigate to edit form`);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'active': styles.statusActive,
      'inactive': styles.statusInactive,
      'pending': styles.statusPending,
      'closed': styles.statusClosed
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[status] || styles.statusDefault}`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    return `$${salary.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
          <button onClick={fetchJobs} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Job Listings</h1>
        <div className={styles.headerActions}>
          <button onClick={fetchJobs} className={styles.refreshButton}>
            Refresh
          </button>
          <span className={styles.jobCount}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Jobs Found</h3>
          <p>There are currently no job listings available.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className={styles.tableContainer}>
            <table className={styles.jobTable}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className={styles.jobRow}>
                    <td className={styles.jobTitle}>
                      <strong>{job.title || 'Untitled Position'}</strong>
                      {job.department && (
                        <span className={styles.department}>{job.department}</span>
                      )}
                    </td>
                    <td>{job.company || 'N/A'}</td>
                    <td>{job.location || 'Remote'}</td>
                    <td>{formatSalary(job.salary)}</td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td>{formatDate(job.createdAt || job.datePosted)}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleEdit(job.id)}
                          className={styles.editButton}
                          title="Edit job"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className={styles.deleteButton}
                          disabled={deleteLoading === job.id}
                          title="Delete job"
                        >
                          {deleteLoading === job.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={styles.cardContainer}>
            {jobs.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.cardHeader}>
                  <h3>{job.title || 'Untitled Position'}</h3>
                  {getStatusBadge(job.status)}
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <span className={styles.label}>Company:</span>
                    <span>{job.company || 'N/A'}</span>
                  </div>
                  
                  <div className={styles.cardRow}>
                    <span className={styles.label}>Location:</span>
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  
                  <div className={styles.cardRow}>
                    <span className={styles.label}>Salary:</span>
                    <span>{formatSalary(job.salary)}</span>
                  </div>
                  
                  {job.department && (
                    <div className={styles.cardRow}>
                      <span className={styles.label}>Department:</span>
                      <span>{job.department}</span>
                    </div>
                  )}
                  
                  <div className={styles.cardRow}>
                    <span className={styles.label}>Posted:</span>
                    <span>{formatDate(job.createdAt || job.datePosted)}</span>
                  </div>
                </div>
                
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleEdit(job.id)}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className={styles.deleteButton}
                    disabled={deleteLoading === job.id}
                  >
                    {deleteLoading === job.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default JobList;