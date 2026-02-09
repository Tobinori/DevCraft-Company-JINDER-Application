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
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  salary: {
    type: String,
    trim: true,
    maxlength: [50, 'Salary field cannot exceed 50 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['applied', 'interview', 'offer', 'rejected'],
      message: 'Status must be one of: applied, interview, offer, rejected'
    },
    default: 'applied'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Index for better query performance
jobSchema.index({ company: 1, title: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDate: -1 });

// Virtual for formatted application date
jobSchema.virtual('formattedApplicationDate').get(function() {
  return this.applicationDate.toLocaleDateString();
});

// Method to get jobs by status
jobSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Method to get recent applications
jobSchema.statics.getRecentApplications = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return this.find({ applicationDate: { $gte: startDate } }).sort({ applicationDate: -1 });
};

// Instance method to update status
jobSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);