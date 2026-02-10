const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Position title is required'],
    trim: true,
    maxlength: [100, 'Position title cannot exceed 100 characters']
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
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative'],
    max: [10000000, 'Salary seems unrealistic']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
jobSchema.index({ company: 1, position: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDate: -1 });

// Virtual for days since application
jobSchema.virtual('daysSinceApplication').get(function() {
  if (!this.applicationDate) return null;
  const diffTime = Date.now() - this.applicationDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate application date
jobSchema.pre('save', function(next) {
  if (this.applicationDate && this.applicationDate > new Date()) {
    next(new Error('Application date cannot be in the future'));
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);