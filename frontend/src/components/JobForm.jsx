import React, { useState, useEffect } from 'react';
import './JobForm.css';

const JobForm = ({ job = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    positionTitle: '',
    applicationDate: '',
    status: 'Applied',
    salaryMin: '',
    salaryMax: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'Applied', label: 'Applied' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Offer', label: 'Offer' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  // Initialize form with existing job data if editing
  useEffect(() => {
    if (job) {
      setFormData({
        companyName: job.companyName || '',
        positionTitle: job.positionTitle || '',
        applicationDate: job.applicationDate || '',
        status: job.status || 'Applied',
        salaryMin: job.salaryMin || '',
        salaryMax: job.salaryMax || '',
        notes: job.notes || ''
      });
    }
  }, [job]);

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.positionTitle.trim()) {
      newErrors.positionTitle = 'Position title is required';
    }

    if (!formData.applicationDate) {
      newErrors.applicationDate = 'Application date is required';
    } else {
      const selectedDate = new Date(formData.applicationDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        newErrors.applicationDate = 'Application date cannot be in the future';
      }
    }

    // Salary validation
    if (formData.salaryMin && formData.salaryMax) {
      const minSalary = parseFloat(formData.salaryMin);
      const maxSalary = parseFloat(formData.salaryMax);
      
      if (isNaN(minSalary) || minSalary < 0) {
        newErrors.salaryMin = 'Please enter a valid minimum salary';
      }
      
      if (isNaN(maxSalary) || maxSalary < 0) {
        newErrors.salaryMax = 'Please enter a valid maximum salary';
      }
      
      if (!isNaN(minSalary) && !isNaN(maxSalary) && minSalary > maxSalary) {
        newErrors.salaryMax = 'Maximum salary must be greater than minimum salary';
      }
    }

    // Individual salary field validation
    if (formData.salaryMin && (isNaN(parseFloat(formData.salaryMin)) || parseFloat(formData.salaryMin) < 0)) {
      newErrors.salaryMin = 'Please enter a valid minimum salary';
    }

    if (formData.salaryMax && (isNaN(parseFloat(formData.salaryMax)) || parseFloat(formData.salaryMax) < 0)) {
      newErrors.salaryMax = 'Please enter a valid maximum salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const jobData = {
        ...formData,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        id: job?.id // Include ID if editing existing job
      };
      
      await onSubmit(jobData);
    } catch (error) {
      console.error('Error submitting job form:', error);
      setErrors({ submit: 'Failed to save job application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const formatSalary = (value) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = formatSalary(value);
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="job-form-container">
      <div className="job-form-header">
        <h2>{job ? 'Edit Job Application' : 'Add New Job Application'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="job-form">
        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyName">
              Company Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={errors.companyName ? 'error' : ''}
              placeholder="Enter company name"
              maxLength={100}
            />
            {errors.companyName && (
              <span className="error-message">{errors.companyName}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="positionTitle">
              Position Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="positionTitle"
              name="positionTitle"
              value={formData.positionTitle}
              onChange={handleInputChange}
              className={errors.positionTitle ? 'error' : ''}
              placeholder="Enter position title"
              maxLength={100}
            />
            {errors.positionTitle && (
              <span className="error-message">{errors.positionTitle}</span>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="applicationDate">
              Application Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="applicationDate"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleInputChange}
              className={errors.applicationDate ? 'error' : ''}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.applicationDate && (
              <span className="error-message">{errors.applicationDate}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="status">
              Status <span className="required">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={errors.status ? 'error' : ''}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <span className="error-message">{errors.status}</span>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="salaryMin">
              Minimum Salary ($)
            </label>
            <input
              type="text"
              id="salaryMin"
              name="salaryMin"
              value={formData.salaryMin}
              onChange={handleSalaryChange}
              className={errors.salaryMin ? 'error' : ''}
              placeholder="e.g., 60,000"
            />
            {errors.salaryMin && (
              <span className="error-message">{errors.salaryMin}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="salaryMax">
              Maximum Salary ($)
            </label>
            <input
              type="text"
              id="salaryMax"
              name="salaryMax"
              value={formData.salaryMax}
              onChange={handleSalaryChange}
              className={errors.salaryMax ? 'error' : ''}
              placeholder="e.g., 80,000"
            />
            {errors.salaryMax && (
              <span className="error-message">{errors.salaryMax}</span>
            )}
          </div>
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className={errors.notes ? 'error' : ''}
            placeholder="Add any additional notes about this job application..."
            rows={4}
            maxLength={1000}
          />
          {errors.notes && (
            <span className="error-message">{errors.notes}</span>
          )}
          <div className="character-count">
            {formData.notes.length}/1000 characters
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                {job ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              job ? 'Update Job' : 'Add Job'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;