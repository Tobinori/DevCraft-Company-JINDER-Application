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
    required: true,
    enum: {
      values: ['Applied', 'Interview', 'Offer', 'Rejected'],
      message: 'Status must be one of: Applied, Interview, Offer, Rejected'
    },
    default: 'Applied'
  },
  
  applicationDate: {
    type: Date,
    required: [true, 'Application date is required'],
    default: Date.now,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Application date cannot be in the future'
    }
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      validate: {
        validator: function(max) {
          return !this.salary.min || max >= this.salary.min;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary'
      }
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    period: {
      type: String,
      default: 'yearly',
      enum: ['hourly', 'monthly', 'yearly']
    }
  },
  
  location: {
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country name cannot exceed 50 characters']
    },
    remote: {
      type: Boolean,
      default: false
    },
    hybrid: {
      type: Boolean,
      default: false
    }
  },
  
  contactInfo: {
    recruiterName: {
      type: String,
      trim: true,
      maxlength: [100, 'Recruiter name cannot exceed 100 characters']
    },
    recruiterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(email) {
          if (!email) return true; // Optional field
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
        },
        message: 'Please provide a valid email address'
      }
    },
    recruiterPhone: {
      type: String,
      trim: true,
      validate: {
        validator: function(phone) {
          if (!phone) return true; // Optional field
          return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please provide a valid phone number'
      }
    },
    companyWebsite: {
      type: String,
      trim: true,
      validate: {
        validator: function(url) {
          if (!url) return true; // Optional field
          return /^https?:\/\/.+/.test(url);
        },
        message: 'Please provide a valid URL starting with http:// or https://'
      }
    }
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  jobUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true; // Optional field
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Please provide a valid URL starting with http:// or https://'
    }
  },
  
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  followUpDate: {
    type: Date,
    validate: {
      validator: function(date) {
        if (!date) return true; // Optional field
        return date >= new Date();
      },
      message: 'Follow-up date cannot be in the past'
    }
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

// Virtual for formatted salary
jobSchema.virtual('formattedSalary').get(function() {
  if (!this.salary || (!this.salary.min && !this.salary.max)) {
    return 'Not specified';
  }
  
  const currency = this.salary.currency || 'USD';
  const period = this.salary.period || 'yearly';
  
  let salaryText = '';
  if (this.salary.min && this.salary.max) {
    salaryText = `${currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
  } else if (this.salary.min) {
    salaryText = `${currency} ${this.salary.min.toLocaleString()}+`;
  } else if (this.salary.max) {
    salaryText = `Up to ${currency} ${this.salary.max.toLocaleString()}`;
  }
  
  return `${salaryText} ${period}`;
});

// Virtual for formatted location
jobSchema.virtual('formattedLocation').get(function() {
  if (this.location.remote) {
    return 'Remote';
  }
  
  if (this.location.hybrid) {
    const baseLocation = [this.location.city, this.location.state, this.location.country]
      .filter(Boolean)
      .join(', ');
    return baseLocation ? `${baseLocation} (Hybrid)` : 'Hybrid';
  }
  
  return [this.location.city, this.location.state, this.location.country]
    .filter(Boolean)
    .join(', ') || 'Not specified';
});

// Virtual for days since application
jobSchema.virtual('daysSinceApplication').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.applicationDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance method to check if follow-up is due
jobSchema.methods.isFollowUpDue = function() {
  if (!this.followUpDate) return false;
  return new Date() >= this.followUpDate;
};

// Instance method to update status with validation
jobSchema.methods.updateStatus = function(newStatus, notes = '') {
  const validTransitions = {
    'Applied': ['Interview', 'Rejected'],
    'Interview': ['Offer', 'Rejected', 'Interview'], // Allow multiple interviews
    'Offer': ['Applied'], // Can reapply later
    'Rejected': ['Applied'] // Can reapply later
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n\n${new Date().toLocaleDateString()}: ${notes}` : notes;
  }
  
  return this.save();
};

// Static method to get jobs by status
jobSchema.statics.findByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ applicationDate: -1 });
};

// Static method to get recent jobs
jobSchema.statics.findRecent = function(userId, days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    userId,
    applicationDate: { $gte: cutoffDate }
  }).sort({ applicationDate: -1 });
};

// Static method to get jobs requiring follow-up
jobSchema.statics.findRequiringFollowUp = function(userId) {
  return this.find({
    userId,
    followUpDate: { $lte: new Date() },
    status: { $nin: ['Offer', 'Rejected'] }
  }).sort({ followUpDate: 1 });
};

// Static method to get application statistics
jobSchema.statics.getApplicationStats = async function(userId) {
  const pipeline = [
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDays: {
          $avg: {
            $divide: [
              { $subtract: [new Date(), '$applicationDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Indexes for better query performance
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, applicationDate: -1 });
jobSchema.index({ userId: 1, followUpDate: 1 });
jobSchema.index({ userId: 1, company: 1 });

module.exports = mongoose.model('Job', jobSchema);