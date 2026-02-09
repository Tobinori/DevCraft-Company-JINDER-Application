const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'JINDER API Server is running!' });
});

// Job routes
app.get('/api/jobs', (req, res) => {
  res.json({ message: 'Get all jobs endpoint' });
});

app.post('/api/jobs', (req, res) => {
  res.json({ message: 'Create job endpoint' });
});

app.put('/api/jobs/:id', (req, res) => {
  res.json({ message: `Update job ${req.params.id} endpoint` });
});

app.delete('/api/jobs/:id', (req, res) => {
  res.json({ message: `Delete job ${req.params.id} endpoint` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});