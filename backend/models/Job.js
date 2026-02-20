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
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
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
  salary: {
    type: String,
    trim: true,
    maxlength: [50, 'Salary information cannot exceed 50 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        if (!email) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    },
    maxlength: [100, 'Contact email cannot exceed 100 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days since application
jobSchema.virtual('daysSinceApplication').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.applicationDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted application date
jobSchema.virtual('formattedApplicationDate').get(function() {
  return this.applicationDate.toLocaleDateString();
});

// Instance method to update status
jobSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Instance method to add notes
jobSchema.methods.addNote = function(note) {
  if (this.notes) {
    this.notes += '\n' + note;
  } else {
    this.notes = note;
  }
  return this.save();
};

// Static method to find jobs by status
jobSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find jobs by company
jobSchema.statics.findByCompany = function(company) {
  return this.find({ 
    company: { $regex: new RegExp(company, 'i') } 
  });
};

// Static method to get application statistics
jobSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
};

// Pre-save middleware to validate application date
jobSchema.pre('save', function(next) {
  if (this.applicationDate > new Date()) {
    next(new Error('Application date cannot be in the future'));
  } else {
    next();
  }
});

// Index for better query performance
jobSchema.index({ company: 1, position: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDate: -1 });

module.exports = mongoose.model('Job', jobSchema);