import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import './App.css';

// Placeholder components for now
const Dashboard = () => (
  <div className="page">
    <h2>Dashboard</h2>
    <p>Welcome to JINDER - Your job application tracker</p>
    <div className="dashboard-stats">
      <div className="stat-card">
        <h3>Total Applications</h3>
        <p className="stat-number">0</p>
      </div>
      <div className="stat-card">
        <h3>Pending</h3>
        <p className="stat-number">0</p>
      </div>
      <div className="stat-card">
        <h3>Interviews</h3>
        <p className="stat-number">0</p>
      </div>
    </div>
  </div>
);

const JobList = () => (
  <div className="page">
    <h2>Job Applications</h2>
    <div className="job-list-header">
      <Link to="/jobs/new" className="btn btn-primary">Add New Job</Link>
    </div>
    <p>No job applications yet. <Link to="/jobs/new">Add your first one!</Link></p>
  </div>
);

const AddJob = () => (
  <div className="page">
    <h2>Add New Job Application</h2>
    <form className="job-form">
      <div className="form-group">
        <label htmlFor="company">Company</label>
        <input type="text" id="company" name="company" required />
      </div>
      <div className="form-group">
        <label htmlFor="position">Position</label>
        <input type="text" id="position" name="position" required />
      </div>
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select id="status" name="status">
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="offer">Offer</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Save Job</button>
        <Link to="/jobs" className="btn btn-secondary">Cancel</Link>
      </div>
    </form>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <Link to="/" className="app-title">
              <h1>JINDER - Job Tracker</h1>
            </Link>
            <nav className="main-nav">
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                end
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/jobs" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Jobs
              </NavLink>
              <NavLink 
                to="/jobs/new" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Add Job
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/new" element={<AddJob />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;