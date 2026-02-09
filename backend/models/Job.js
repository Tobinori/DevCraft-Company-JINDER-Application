const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
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
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Add indexes for better query performance
jobSchema.index({ company: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDate: -1 });

// Add a method to format application date
jobSchema.methods.getFormattedDate = function() {
  return this.applicationDate.toLocaleDateString();
};

// Add a static method to find jobs by status
jobSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;