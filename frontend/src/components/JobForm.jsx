import React, { useState } from 'react';
import './JobForm.css';

const JobForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    company: initialData?.company || '',
    status: initialData?.status || 'Applied',
    applicationDate: initialData?.applicationDate || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'Applied', label: 'Applied' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Offer', label: 'Offer' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Job title must be at least 2 characters';
    }

    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (formData.company.trim().length < 2) {
      newErrors.company = 'Company name must be at least 2 characters';
    }

    // Status validation
    if (!statusOptions.some(option => option.value === formData.status)) {
      newErrors.status = 'Please select a valid status';
    }

    // Application date validation
    if (!formData.applicationDate) {
      newErrors.applicationDate = 'Application date is required';
    } else {
      const selectedDate = new Date(formData.applicationDate);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.applicationDate = 'Application date cannot be in the future';
      }
    }

    // Notes validation (optional but with length limit)
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
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

    // Clear error for this field when user starts typing
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
      // Prepare data for submission
      const submissionData = {
        ...formData,
        title: formData.title.trim(),
        company: formData.company.trim(),
        notes: formData.notes.trim()
      };

      await onSubmit(submissionData);
      
      // Reset form if not editing (no initialData)
      if (!initialData) {
        setFormData({
          title: '',
          company: '',
          status: 'Applied',
          applicationDate: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      status: 'Applied',
      applicationDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setErrors({});
  };

  return (
    <div className="job-form-container">
      <form onSubmit={handleSubmit} className="job-form">
        <h2 className="form-title">
          {initialData ? 'Edit Job Application' : 'Add New Job Application'}
        </h2>

        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="e.g., Senior Software Engineer"
            maxLength={100}
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="company" className="form-label">
            Company *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className={`form-input ${errors.company ? 'error' : ''}`}
            placeholder="e.g., Google, Microsoft, Startup Inc."
            maxLength={100}
          />
          {errors.company && (
            <span className="error-message">{errors.company}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="status" className="form-label">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={`form-select ${errors.status ? 'error' : ''}`}
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

        <div className="form-group">
          <label htmlFor="applicationDate" className="form-label">
            Application Date *
          </label>
          <input
            type="date"
            id="applicationDate"
            name="applicationDate"
            value={formData.applicationDate}
            onChange={handleInputChange}
            className={`form-input ${errors.applicationDate ? 'error' : ''}`}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.applicationDate && (
            <span className="error-message">{errors.applicationDate}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className={`form-textarea ${errors.notes ? 'error' : ''}`}
            placeholder="Additional notes about the application, interview details, etc."
            rows={4}
            maxLength={1000}
          />
          <div className="character-count">
            {formData.notes.length}/1000
          </div>
          {errors.notes && (
            <span className="error-message">{errors.notes}</span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : (initialData ? 'Update' : 'Add Job')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;