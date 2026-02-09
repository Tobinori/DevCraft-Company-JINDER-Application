const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
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
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  salaryRange: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      validate: {
        validator: function(value) {
          return !this.salaryRange.min || value >= this.salaryRange.min;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary'
      }
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      minlength: [3, 'Currency code must be 3 characters'],
      maxlength: [3, 'Currency code must be 3 characters']
    }
  },
  deadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= new Date();
      },
      message: 'Deadline cannot be in the past'
    }
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: 'Please enter a valid email address'
    }
  },
  jobUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional field
        const urlRegex = /^https?:\/\/.+/;
        return urlRegex.test(value);
      },
      message: 'Please enter a valid URL starting with http:// or https://'
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  // Additional useful fields
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted application date
jobSchema.virtual('formattedApplicationDate').get(function() {
  return this.applicationDate ? this.applicationDate.toLocaleDateString() : null;
});

// Virtual for days since application
jobSchema.virtual('daysSinceApplication').get(function() {
  if (!this.applicationDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.applicationDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Index for efficient queries
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, applicationDate: -1 });
jobSchema.index({ userId: 1, company: 1 });

// Pre-save middleware for validation
jobSchema.pre('save', function(next) {
  // Ensure deadline is after application date if both exist
  if (this.deadline && this.applicationDate && this.deadline < this.applicationDate) {
    const error = new Error('Deadline cannot be before application date');
    return next(error);
  }
  next();
});

// Static method to get jobs by status
jobSchema.statics.getByStatus = function(userId, status) {
  return this.find({ userId, status, isArchived: false }).sort({ applicationDate: -1 });
};

// Static method to get recent applications
jobSchema.statics.getRecent = function(userId, limit = 10) {
  return this.find({ userId, isArchived: false })
    .sort({ applicationDate: -1 })
    .limit(limit);
};

// Instance method to archive job
jobSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Instance method to update status
jobSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;