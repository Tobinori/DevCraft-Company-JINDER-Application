const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position title is required'],
    trim: true
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
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  location: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        if (!email) return true; // Allow empty email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
jobSchema.index({ company: 1, position: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDate: -1 });

// Virtual for formatted application date
jobSchema.virtual('formattedApplicationDate').get(function() {
  return this.applicationDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Pre-save middleware to ensure proper data formatting
jobSchema.pre('save', function(next) {
  // Capitalize first letter of company and position
  if (this.company) {
    this.company = this.company.charAt(0).toUpperCase() + this.company.slice(1);
  }
  if (this.position) {
    this.position = this.position.charAt(0).toUpperCase() + this.position.slice(1);
  }
  next();
});

// Instance method to update status
jobSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Static method to find jobs by status
jobSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ applicationDate: -1 });
};

// Static method to find recent applications
jobSchema.statics.findRecentApplications = function(days = 30) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  return this.find({
    applicationDate: { $gte: dateThreshold }
  }).sort({ applicationDate: -1 });
};

module.exports = mongoose.model('Job', jobSchema);