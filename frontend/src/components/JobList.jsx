import React, { useState } from 'react';
import JobForm from './JobForm';

const JobList = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      company: 'Tech Corp',
      position: 'Frontend Developer',
      status: 'applied',
      dateApplied: '2024-01-15',
      notes: 'Applied through company website'
    },
    {
      id: 2,
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      status: 'interview',
      dateApplied: '2024-01-10',
      notes: 'Phone screening completed'
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const handleAddJob = (jobData) => {
    const newJob = {
      ...jobData,
      id: Date.now(), // Simple ID generation
      dateApplied: jobData.dateApplied || new Date().toISOString().split('T')[0]
    };
    setJobs(prevJobs => [...prevJobs, newJob]);
    setShowForm(false);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleUpdateJob = (updatedJobData) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === editingJob.id 
          ? { ...updatedJobData, id: editingJob.id }
          : job
      )
    );
    setShowForm(false);
    setEditingJob(null);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      interview: 'bg-yellow-100 text-yellow-800',
      offer: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add New Job
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <JobForm
            initialData={editingJob}
            onSubmit={editingJob ? handleUpdateJob : handleAddJob}
            onCancel={handleCancelForm}
            isEditing={!!editingJob}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job applications yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your job applications by adding your first one.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Your First Job
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company & Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.company}</div>
                          <div className="text-sm text-gray-500">{job.position}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(job.dateApplied).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {job.notes || 'No notes'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditJob(job)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <div className="text-sm text-gray-500">
                Total applications: {jobs.length}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobList;