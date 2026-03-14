const mongoose = require('mongoose');

// Define the Job schema
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
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  salary: {
    type: {
      min: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative']
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary cannot be negative']
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
    validate: {
      validator: function(salary) {
        if (salary && salary.min && salary.max) {
          return salary.min <= salary.max;
        }
        return true;
      },
      message: 'Minimum salary cannot be greater than maximum salary'
    }
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
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
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
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  // Additional metadata
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  followUpDate: {
    type: Date
  },
  jobUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true; // Optional field
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Please provide a valid job URL starting with http:// or https://'
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating days since application
jobSchema.virtual('daysSinceApplication').get(function() {
  if (!this.applicationDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.applicationDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index for better query performance
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ applicationDate: -1 });
jobSchema.index({ company: 1 });

// Pre-save middleware to validate salary consistency
jobSchema.pre('save', function(next) {
  // Ensure consistent data formatting
  if (this.contactInfo && this.contactInfo.recruiterEmail) {
    this.contactInfo.recruiterEmail = this.contactInfo.recruiterEmail.toLowerCase();
  }
  
  // Clean up phone number
  if (this.contactInfo && this.contactInfo.recruiterPhone) {
    this.contactInfo.recruiterPhone = this.contactInfo.recruiterPhone.replace(/[\s\-\(\)]/g, '');
  }
  
  next();
});

// Static method to find jobs by status
jobSchema.statics.findByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ applicationDate: -1 });
};

// Static method to get application statistics
jobSchema.statics.getApplicationStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance method to update status with timestamp
jobSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'Interview') {
    this.followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  }
  return this.save();
};

// Create and export the model
const Job = mongoose.model('Job', jobSchema);

module.exports = Job;