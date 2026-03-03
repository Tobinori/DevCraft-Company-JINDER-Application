import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import JobList from './components/JobList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">JINDER - Job Application Tracker</h1>
            <p className="app-subtitle">Swipe through your job applications</p>
          </div>
        </header>
        
        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<JobList />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        
        <footer className="app-footer">
          <p>&copy; 2024 JINDER. Made with ❤️ for job seekers.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;