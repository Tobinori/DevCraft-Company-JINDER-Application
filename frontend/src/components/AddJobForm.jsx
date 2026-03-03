import React, { useState } from 'react';
import './AddJobForm.css';

const AddJobForm = ({ onJobAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'Applied',
    applicationDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const statusOptions = ['Applied', 'Interview', 'Offer', 'Rejected'];

  const handleChange = (e) => {
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

    // Clear submit message
    if (submitMessage.text) {
      setSubmitMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (formData.company.trim().length < 2) {
      newErrors.company = 'Company name must be at least 2 characters';
    }

    // Position validation
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    } else if (formData.position.trim().length < 2) {
      newErrors.position = 'Position must be at least 2 characters';
    }

    // Status validation
    if (!statusOptions.includes(formData.status)) {
      newErrors.status = 'Please select a valid status';
    }

    // Application date validation
    if (!formData.applicationDate) {
      newErrors.applicationDate = 'Application date is required';
    } else {
      const selectedDate = new Date(formData.applicationDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (selectedDate > today) {
        newErrors.applicationDate = 'Application date cannot be in the future';
      }
    }

    // Notes validation (optional but check length if provided)
    if (formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitMessage({ 
        type: 'error', 
        text: 'Please fix the errors above before submitting.' 
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          company: formData.company.trim(),
          position: formData.position.trim(),
          notes: formData.notes.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setSubmitMessage({ 
        type: 'success', 
        text: 'Job application added successfully!' 
      });

      // Reset form
      setFormData({
        company: '',
        position: '',
        status: 'Applied',
        applicationDate: new Date().toISOString().split('T')[0],
        notes: ''
      });

      // Notify parent component
      if (onJobAdded) {
        onJobAdded(data);
      }

    } catch (error) {
      console.error('Error adding job:', error);
      setSubmitMessage({ 
        type: 'error', 
        text: error.message || 'Failed to add job. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      company: '',
      position: '',
      status: 'Applied',
      applicationDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setErrors({});
    setSubmitMessage({ type: '', text: '' });
  };

  return (
    <div className="add-job-form-container">
      <div className="add-job-form">
        <h2>Add New Job Application</h2>
        
        {submitMessage.text && (
          <div className={`message ${submitMessage.type}`}>
            {submitMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="company">Company Name *</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={errors.company ? 'error' : ''}
              placeholder="Enter company name"
              maxLength={100}
            />
            {errors.company && <span className="error-text">{errors.company}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={errors.position ? 'error' : ''}
              placeholder="Enter job position"
              maxLength={100}
            />
            {errors.position && <span className="error-text">{errors.position}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={errors.status ? 'error' : ''}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.status && <span className="error-text">{errors.status}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="applicationDate">Application Date *</label>
            <input
              type="date"
              id="applicationDate"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleChange}
              className={errors.applicationDate ? 'error' : ''}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.applicationDate && <span className="error-text">{errors.applicationDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={errors.notes ? 'error' : ''}
              placeholder="Additional notes about this application (optional)"
              rows={4}
              maxLength={1000}
            />
            <div className="character-count">
              {formData.notes.length}/1000 characters
            </div>
            {errors.notes && <span className="error-text">{errors.notes}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Reset
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobForm;