import React, { useState, useEffect } from 'react';
import { jobsAPI } from '../services/api';
import './JobForm.css';

const JobForm = ({ jobId = null, onSave, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    location: '',
    salaryRange: '',
    applicationDate: '',
    status: 'Applied',
    jobDescription: '',
    notes: '',
    applicationUrl: '',
    contactPerson: {
      name: '',
      email: ''
    },
    requiredSkills: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const statusOptions = [
    { value: 'Applied', label: 'Applied' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Offer', label: 'Offer' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        applicationDate: initialData.applicationDate ? 
          new Date(initialData.applicationDate).toISOString().split('T')[0] : '',
        contactPerson: initialData.contactPerson || { name: '', email: '' },
        requiredSkills: initialData.requiredSkills || []
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    // Email validation if contact email is provided
    if (formData.contactPerson.email && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPerson.email)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    // URL validation if application URL is provided
    if (formData.applicationUrl && 
        !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(formData.applicationUrl)) {
      newErrors.applicationUrl = 'Please enter a valid URL';
    }

    // Date validation
    if (formData.applicationDate) {
      const selectedDate = new Date(formData.applicationDate);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.applicationDate = 'Application date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !formData.requiredSkills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          requiredSkills: [...prev.requiredSkills, skill]
        }));
        setSkillInput('');
      }
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }));
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
        applicationDate: formData.applicationDate || null
      };

      let response;
      if (jobId) {
        response = await jobsAPI.updateJob(jobId, jobData);
      } else {
        response = await jobsAPI.createJob(jobData);
      }

      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      console.error('Error saving job:', error);
      setErrors({ submit: 'Failed to save job. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="job-form-container">
      <div className="job-form">
        <h2>{jobId ? 'Edit Job Application' : 'Add New Job Application'}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Company Name */}
          <div className="form-group">
            <label htmlFor="companyName" className="required">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={errors.companyName ? 'error' : ''}
              required
            />
            {errors.companyName && (
              <span className="error-message">{errors.companyName}</span>
            )}
          </div>

          {/* Job Title */}
          <div className="form-group">
            <label htmlFor="jobTitle" className="required">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              className={errors.jobTitle ? 'error' : ''}
              required
            />
            {errors.jobTitle && (
              <span className="error-message">{errors.jobTitle}</span>
            )}
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., San Francisco, CA (Remote)"
            />
          </div>

          {/* Salary Range */}
          <div className="form-group">
            <label htmlFor="salaryRange">Salary Range</label>
            <input
              type="text"
              id="salaryRange"
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleInputChange}
              placeholder="e.g., $80,000 - $120,000"
            />
          </div>

          {/* Application Date */}
          <div className="form-group">
            <label htmlFor="applicationDate">Application Date</label>
            <input
              type="date"
              id="applicationDate"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleInputChange}
              className={errors.applicationDate ? 'error' : ''}
            />
            {errors.applicationDate && (
              <span className="error-message">{errors.applicationDate}</span>
            )}
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status">Application Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Application URL */}
          <div className="form-group">
            <label htmlFor="applicationUrl">Application URL</label>
            <input
              type="url"
              id="applicationUrl"
              name="applicationUrl"
              value={formData.applicationUrl}
              onChange={handleInputChange}
              className={errors.applicationUrl ? 'error' : ''}
              placeholder="https://..."
            />
            {errors.applicationUrl && (
              <span className="error-message">{errors.applicationUrl}</span>
            )}
          </div>

          {/* Contact Person */}
          <div className="form-section">
            <h3>Contact Person</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactPersonName">Name</label>
                <input
                  type="text"
                  id="contactPersonName"
                  name="contactPerson.name"
                  value={formData.contactPerson.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactPersonEmail">Email</label>
                <input
                  type="email"
                  id="contactPersonEmail"
                  name="contactPerson.email"
                  value={formData.contactPerson.email}
                  onChange={handleInputChange}
                  className={errors.contactEmail ? 'error' : ''}
                />
                {errors.contactEmail && (
                  <span className="error-message">{errors.contactEmail}</span>
                )}
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="form-group">
            <label>Required Skills</label>
            <div className="skills-input">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillAdd}
                placeholder="Type a skill and press Enter"
              />
              <button
                type="button"
                onClick={handleSkillAdd}
                className="add-skill-btn"
              >
                Add
              </button>
            </div>
            <div className="skills-list">
              {formData.requiredSkills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill)}
                    className="remove-skill"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div className="form-group">
            <label htmlFor="jobDescription">Job Description</label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              rows={6}
              placeholder="Paste the job description here..."
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Any additional notes about this application..."
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (jobId ? 'Update Job' : 'Add Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;