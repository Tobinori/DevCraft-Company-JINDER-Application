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
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  salary: {
    type: String,
    trim: true,
    maxlength: [50, 'Salary cannot exceed 50 characters']
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

// Index for faster queries
jobSchema.index({ company: 1, position: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDate: -1 });

// Virtual for days since application
jobSchema.virtual('daysSinceApplication').get(function() {
  if (!this.applicationDate) return null;
  const diffTime = Math.abs(new Date() - this.applicationDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to validate application date
jobSchema.pre('save', function(next) {
  if (this.applicationDate && this.applicationDate > new Date()) {
    next(new Error('Application date cannot be in the future'));
  } else {
    next();
  }
});

// Instance method to update status
jobSchema.methods.updateStatus = function(newStatus) {
  const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status');
  }
  this.status = newStatus;
  return this.save();
};

// Static method to find jobs by status
jobSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to get application statistics
jobSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;