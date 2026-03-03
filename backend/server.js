const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for demo (replace with database in production)
let jobs = [
  {
    id: 1,
    company: 'TechCorp',
    position: 'Frontend Developer',
    status: 'applied',
    appliedDate: '2024-01-15',
    notes: 'Seems like a great fit for React skills',
    salary: '$75,000',
    location: 'San Francisco, CA'
  },
  {
    id: 2,
    company: 'StartupXYZ',
    position: 'Full Stack Engineer',
    status: 'interview',
    appliedDate: '2024-01-10',
    notes: 'Technical interview scheduled for next week',
    salary: '$85,000',
    location: 'Remote'
  },
  {
    id: 3,
    company: 'BigTech Inc',
    position: 'Software Engineer',
    status: 'rejected',
    appliedDate: '2024-01-05',
    notes: 'Not a good cultural fit according to feedback',
    salary: '$95,000',
    location: 'New York, NY'
  }
];

let nextId = 4;

// Routes

// Get all jobs
app.get('/api/jobs', (req, res) => {
  const { status, search } = req.query;
  let filteredJobs = jobs;
  
  if (status && status !== 'all') {
    filteredJobs = filteredJobs.filter(job => job.status === status);
  }
  
  if (search) {
    filteredJobs = filteredJobs.filter(job => 
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.position.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json(filteredJobs);
});

// Get single job
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// Create new job
app.post('/api/jobs', (req, res) => {
  const { company, position, status, appliedDate, notes, salary, location } = req.body;
  
  if (!company || !position) {
    return res.status(400).json({ error: 'Company and position are required' });
  }
  
  const newJob = {
    id: nextId++,
    company,
    position,
    status: status || 'applied',
    appliedDate: appliedDate || new Date().toISOString().split('T')[0],
    notes: notes || '',
    salary: salary || '',
    location: location || ''
  };
  
  jobs.push(newJob);
  res.status(201).json(newJob);
});

// Update job
app.put('/api/jobs/:id', (req, res) => {
  const jobIndex = jobs.findIndex(j => j.id === parseInt(req.params.id));
  if (jobIndex === -1) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  jobs[jobIndex] = { ...jobs[jobIndex], ...req.body };
  res.json(jobs[jobIndex]);
});

// Delete job
app.delete('/api/jobs/:id', (req, res) => {
  const jobIndex = jobs.findIndex(j => j.id === parseInt(req.params.id));
  if (jobIndex === -1) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  jobs.splice(jobIndex, 1);
  res.status(204).send();
});

// Get job statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    offer: jobs.filter(j => j.status === 'offer').length,
    rejected: jobs.filter(j => j.status === 'rejected').length
  };
  res.json(stats);
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 JINDER Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`💼 Sample jobs loaded: ${jobs.length}`);
});