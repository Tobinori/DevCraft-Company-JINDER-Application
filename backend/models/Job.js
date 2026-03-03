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
    required: [true, 'Application status is required'],
    enum: {
      values: ['Applied', 'Interview', 'Offer', 'Rejected'],
      message: 'Status must be one of: Applied, Interview, Offer, Rejected'
    },
    default: 'Applied'
  },
  dateApplied: {
    type: Date,
    required: [true, 'Date applied is required'],
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
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
jobSchema.index({ userId: 1, dateApplied: -1 });
jobSchema.index({ userId: 1, status: 1 });

// Virtual for formatted salary
jobSchema.virtual('formattedSalary').get(function() {
  if (this.salary) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.salary);
  }
  return null;
});

// Virtual for days since applied
jobSchema.virtual('daysSinceApplied').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.dateApplied);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to ensure dateApplied is not in the future
jobSchema.pre('save', function(next) {
  if (this.dateApplied > new Date()) {
    return next(new Error('Date applied cannot be in the future'));
  }
  next();
});

// Instance method to update status
jobSchema.methods.updateStatus = function(newStatus, notes) {
  this.status = newStatus;
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Static method to get jobs by status for a user
jobSchema.statics.findByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ dateApplied: -1 });
};

// Static method to get job statistics for a user
jobSchema.statics.getStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgSalary: { $avg: '$salary' }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count',
            avgSalary: '$avgSalary'
          }
        }
      }
    }
  ]);
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;