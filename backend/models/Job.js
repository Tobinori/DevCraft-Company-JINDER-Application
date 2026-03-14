/**
 * Job Model Class
 * Represents a job application with all relevant properties and validation
 */

class Job {
  // Status enum for job application states
  static STATUS = {
    APPLIED: 'Applied',
    INTERVIEW: 'Interview', 
    OFFER: 'Offer',
    REJECTED: 'Rejected'
  };

  constructor({
    id = null,
    title = '',
    company = '',
    status = Job.STATUS.APPLIED,
    dateApplied = new Date(),
    notes = '',
    salary = null
  } = {}) {
    this.id = id;
    this.title = title;
    this.company = company;
    this.status = status;
    this.dateApplied = new Date(dateApplied);
    this.notes = notes;
    this.salary = salary;
  }

  /**
   * Validates the job object
   * @returns {Object} - {isValid: boolean, errors: string[]}
   */
  validate() {
    const errors = [];

    // Required field validations
    if (!this.title || this.title.trim().length === 0) {
      errors.push('Job title is required');
    }

    if (!this.company || this.company.trim().length === 0) {
      errors.push('Company name is required');
    }

    // Status validation
    if (!Object.values(Job.STATUS).includes(this.status)) {
      errors.push('Invalid status. Must be one of: Applied, Interview, Offer, Rejected');
    }

    // Date validation
    if (!(this.dateApplied instanceof Date) || isNaN(this.dateApplied)) {
      errors.push('Invalid date applied');
    }

    // Salary validation (if provided)
    if (this.salary !== null && (typeof this.salary !== 'number' || this.salary < 0)) {
      errors.push('Salary must be a positive number or null');
    }

    // Title and company length validation
    if (this.title && this.title.length > 200) {
      errors.push('Job title must be less than 200 characters');
    }

    if (this.company && this.company.length > 200) {
      errors.push('Company name must be less than 200 characters');
    }

    // Notes length validation
    if (this.notes && this.notes.length > 1000) {
      errors.push('Notes must be less than 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validates required fields only
   * @returns {boolean}
   */
  isValidForCreation() {
    return this.title.trim().length > 0 && 
           this.company.trim().length > 0 && 
           Object.values(Job.STATUS).includes(this.status);
  }

  /**
   * Updates the job status
   * @param {string} newStatus - New status from Job.STATUS enum
   * @returns {boolean} - Success status
   */
  updateStatus(newStatus) {
    if (!Object.values(Job.STATUS).includes(newStatus)) {
      return false;
    }
    this.status = newStatus;
    return true;
  }

  /**
   * Converts job to plain object for JSON serialization
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      company: this.company,
      status: this.status,
      dateApplied: this.dateApplied.toISOString(),
      notes: this.notes,
      salary: this.salary
    };
  }

  /**
   * Creates a Job instance from a plain object
   * @param {Object} data - Plain object with job data
   * @returns {Job}
   */
  static fromJSON(data) {
    return new Job({
      id: data.id,
      title: data.title,
      company: data.company,
      status: data.status,
      dateApplied: data.dateApplied,
      notes: data.notes,
      salary: data.salary
    });
  }

  /**
   * Gets all available status options
   * @returns {string[]}
   */
  static getStatusOptions() {
    return Object.values(Job.STATUS);
  }
}

module.exports = Job;