const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['Applied', 'Interview', 'Offer', 'Rejected'],
      message: 'Status must be one of: Applied, Interview, Offer, Rejected'
    },
    default: 'Applied'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  salary: {
    type: Number,
    min: [0, 'Salary must be a positive number']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
jobSchema.index({ company: 1, title: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDate: -1 });

// Virtual for formatted application date
jobSchema.virtual('formattedApplicationDate').get(function() {
  return this.applicationDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Pre-save middleware to validate salary format
jobSchema.pre('save', function(next) {
  if (this.salary && this.salary < 0) {
    const error = new Error('Salary must be a positive number');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);