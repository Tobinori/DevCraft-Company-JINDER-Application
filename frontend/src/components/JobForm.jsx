import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const JobForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    description: initialData?.description || '',
    requirements: initialData?.requirements || '',
    salary: initialData?.salary || '',
    jobType: initialData?.jobType || 'full-time',
    experienceLevel: initialData?.experienceLevel || 'entry'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const validationRules = useMemo(() => ({
    title: {
      required: true,
      minLength: 3,
      maxLength: 100,
      message: 'Job title must be between 3 and 100 characters'
    },
    company: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: 'Company name must be between 2 and 50 characters'
    },
    location: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Location must be between 2 and 100 characters'
    },
    description: {
      required: true,
      minLength: 50,
      maxLength: 2000,
      message: 'Description must be between 50 and 2000 characters'
    },
    requirements: {
      required: true,
      minLength: 20,
      maxLength: 1000,
      message: 'Requirements must be between 20 and 1000 characters'
    },
    salary: {
      pattern: /^\$?[\d]+(\s*-\s*\$?[\d]+)?$|^(Competitive|Negotiable)$/i,
      message: 'Please enter a valid salary (e.g., $50,000, $50k-60k, or Competitive)'
    }
  }), []);

  // Validate single field
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;

    if (rule.required && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.message;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      return rule.message;
    }

    return null;
  }, [validationRules]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateField]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [formData, validateForm, onSubmit]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return Object.keys(formData).every(field => {
      const error = validateField(field, formData[field]);
      return !error;
    });
  }, [formData, validateField]);

  return (
    <div className="job-form-container">
      <form onSubmit={handleSubmit} className="job-form" noValidate>
        {/* Job Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${
              touched.title && errors.title ? 'form-input--error' : ''
            }`}
            placeholder="e.g. Senior Software Engineer"
            disabled={isLoading}
            required
          />
          {touched.title && errors.title && (
            <span className="form-error">{errors.title}</span>
          )}
        </div>

        {/* Company */}
        <div className="form-group">
          <label htmlFor="company" className="form-label">
            Company *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${
              touched.company && errors.company ? 'form-input--error' : ''
            }`}
            placeholder="e.g. Tech Corp Inc."
            disabled={isLoading}
            required
          />
          {touched.company && errors.company && (
            <span className="form-error">{errors.company}</span>
          )}
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${
              touched.location && errors.location ? 'form-input--error' : ''
            }`}
            placeholder="e.g. San Francisco, CA or Remote"
            disabled={isLoading}
            required
          />
          {touched.location && errors.location && (
            <span className="form-error">{errors.location}</span>
          )}
        </div>

        {/* Job Type and Experience Level Row */}
        <div className="form-row">
          <div className="form-group form-group--half">
            <label htmlFor="jobType" className="form-label">
              Job Type
            </label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="form-input form-select"
              disabled={isLoading}
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="form-group form-group--half">
            <label htmlFor="experienceLevel" className="form-label">
              Experience Level
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="form-input form-select"
              disabled={isLoading}
            >
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>

        {/* Salary */}
        <div className="form-group">
          <label htmlFor="salary" className="form-label">
            Salary Range
          </label>
          <input
            type="text"
            id="salary"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-input ${
              touched.salary && errors.salary ? 'form-input--error' : ''
            }`}
            placeholder="e.g. $80,000 - $120,000 or Competitive"
            disabled={isLoading}
          />
          {touched.salary && errors.salary && (
            <span className="form-error">{errors.salary}</span>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Job Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-textarea ${
              touched.description && errors.description ? 'form-input--error' : ''
            }`}
            placeholder="Describe the role, responsibilities, and what makes this position unique..."
            rows={6}
            disabled={isLoading}
            required
          />
          {touched.description && errors.description && (
            <span className="form-error">{errors.description}</span>
          )}
          <div className="character-count">
            {formData.description.length}/2000
          </div>
        </div>

        {/* Requirements */}
        <div className="form-group">
          <label htmlFor="requirements" className="form-label">
            Requirements *
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`form-textarea ${
              touched.requirements && errors.requirements ? 'form-input--error' : ''
            }`}
            placeholder="List the required skills, experience, education, and qualifications..."
            rows={4}
            disabled={isLoading}
            required
          />
          {touched.requirements && errors.requirements && (
            <span className="form-error">{errors.requirements}</span>
          )}
          <div className="character-count">
            {formData.requirements.length}/1000
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn-primary ${
              isLoading ? 'btn--loading' : ''
            } ${
              !isFormValid ? 'btn--disabled' : ''
            }`}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Update Job' : 'Create Job'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

JobForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    title: PropTypes.string,
    company: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    requirements: PropTypes.string,
    salary: PropTypes.string,
    jobType: PropTypes.oneOf(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
    experienceLevel: PropTypes.oneOf(['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])
  }),
  isLoading: PropTypes.bool
};

export default React.memo(JobForm);