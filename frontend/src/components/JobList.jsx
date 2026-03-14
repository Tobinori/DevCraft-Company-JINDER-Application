import React, { useState, useEffect } from 'react';
import './JobList.css';

const JobList = ({ jobs, onEditJob, onDeleteJob, onAddJob }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // table or cards

  // Get unique companies for filter dropdown
  const uniqueCompanies = [...new Set(jobs.map(job => job.company))].sort();

  // Filter and sort jobs
  const filteredAndSortedJobs = jobs
    .filter(job => {
      const matchesSearch = 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.notes && job.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesCompany = companyFilter === '' || job.company === companyFilter;
      
      return matchesSearch && matchesStatus && matchesCompany;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy === 'salary') {
        aVal = parseFloat(aVal?.replace(/[^\d.-]/g, '') || 0);
        bVal = parseFloat(bVal?.replace(/[^\d.-]/g, '') || 0);
      } else {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'applied': 'status-applied',
      'interviewing': 'status-interviewing',
      'offered': 'status-offered',
      'rejected': 'status-rejected',
      'withdrawn': 'status-withdrawn'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    return salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const renderTableView = () => (
    <div className="table-container">
      <table className="jobs-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('company')} className="sortable">
              Company {getSortIcon('company')}
            </th>
            <th onClick={() => handleSort('position')} className="sortable">
              Position {getSortIcon('position')}
            </th>
            <th onClick={() => handleSort('date')} className="sortable">
              Date Applied {getSortIcon('date')}
            </th>
            <th onClick={() => handleSort('status')} className="sortable">
              Status {getSortIcon('status')}
            </th>
            <th onClick={() => handleSort('salary')} className="sortable">
              Salary {getSortIcon('salary')}
            </th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedJobs.map(job => (
            <tr key={job.id} className="job-row">
              <td className="company-cell">
                <strong>{job.company}</strong>
              </td>
              <td className="position-cell">{job.position}</td>
              <td className="date-cell">{formatDate(job.date)}</td>
              <td className="status-cell">{getStatusBadge(job.status)}</td>
              <td className="salary-cell">{formatSalary(job.salary)}</td>
              <td className="notes-cell">
                <div className="notes-preview">
                  {job.notes ? (job.notes.length > 50 ? job.notes.substring(0, 50) + '...' : job.notes) : 'No notes'}
                </div>
              </td>
              <td className="actions-cell">
                <button 
                  className="btn btn-edit"
                  onClick={() => onEditJob(job)}
                  title="Edit job"
                >
                  ✏️
                </button>
                <button 
                  className="btn btn-delete"
                  onClick={() => onDeleteJob(job.id)}
                  title="Delete job"
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

  const renderCardView = () => (
    <div className="cards-container">
      {filteredAndSortedJobs.map(job => (
        <div key={job.id} className="job-card">
          <div className="card-header">
            <h3 className="job-title">{job.position}</h3>
            <div className="card-actions">
              <button 
                className="btn btn-edit"
                onClick={() => onEditJob(job)}
                title="Edit job"
              >
                ✏️
              </button>
              <button 
                className="btn btn-delete"
                onClick={() => onDeleteJob(job.id)}
                title="Delete job"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div className="card-body">
            <div className="card-field">
              <span className="field-label">Company:</span>
              <span className="field-value">{job.company}</span>
            </div>
            
            <div className="card-field">
              <span className="field-label">Date Applied:</span>
              <span className="field-value">{formatDate(job.date)}</span>
            </div>
            
            <div className="card-field">
              <span className="field-label">Status:</span>
              {getStatusBadge(job.status)}
            </div>
            
            <div className="card-field">
              <span className="field-label">Salary:</span>
              <span className="field-value">{formatSalary(job.salary)}</span>
            </div>
            
            {job.notes && (
              <div className="card-field notes-field">
                <span className="field-label">Notes:</span>
                <div className="field-value notes-content">{job.notes}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <h3>No job applications found</h3>
      <p>
        {searchTerm || statusFilter !== 'all' || companyFilter
          ? 'Try adjusting your search filters or '
          : 'Start tracking your job applications by '}
        <button className="btn btn-primary" onClick={onAddJob}>
          adding your first job
        </button>
      </p>
    </div>
  );

  return (
    <div className="job-list">
      {/* Header with controls */}
      <div className="job-list-header">
        <div className="header-title">
          <h2>Job Applications ({jobs.length})</h2>
          <p className="subtitle">
            {filteredAndSortedJobs.length !== jobs.length && 
              `Showing ${filteredAndSortedJobs.length} of ${jobs.length} jobs`}
          </p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onAddJob}>
            + Add Job
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search jobs, companies, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Companies</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>
        
        <div className="view-controls">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              📊 Table
            </button>
            <button 
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              🗃️ Cards
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="job-list-content">
        {filteredAndSortedJobs.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className={`jobs-display ${viewMode}`}>
            {viewMode === 'table' ? renderTableView() : renderCardView()}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;