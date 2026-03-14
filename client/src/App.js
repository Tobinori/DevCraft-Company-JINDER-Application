import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [jobs, setJobs] = useState([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      setJobs(response.data.jobs);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch jobs');
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      console.log('Liked job:', jobs[currentJobIndex].title);
    } else {
      console.log('Passed on job:', jobs[currentJobIndex].title);
    }
    
    if (currentJobIndex < jobs.length - 1) {
      setCurrentJobIndex(currentJobIndex + 1);
    } else {
      alert('No more jobs! Demo complete.');
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading JINDER...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">{error}</div>
      </div>
    );
  }

  const currentJob = jobs[currentJobIndex];

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔥 JINDER</h1>
        <p>Swipe right to apply, left to pass</p>
      </header>
      
      <main className="job-container">
        {currentJob ? (
          <div className="job-card">
            <h2>{currentJob.title}</h2>
            <h3>{currentJob.company}</h3>
            <p className="location">{currentJob.location}</p>
            <p className="salary">{currentJob.salary}</p>
            <p className="description">{currentJob.description}</p>
            
            <div className="requirements">
              <h4>Requirements:</h4>
              <ul>
                {currentJob.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
            
            <div className="actions">
              <button 
                className="pass-btn" 
                onClick={() => handleSwipe('left')}
              >
                👎 Pass
              </button>
              <button 
                className="apply-btn" 
                onClick={() => handleSwipe('right')}
              >
                👍 Apply
              </button>
            </div>
          </div>
        ) : (
          <div className="no-jobs">No more jobs available!</div>
        )}
      </main>
      
      <footer>
        <p>Job {currentJobIndex + 1} of {jobs.length}</p>
      </footer>
    </div>
  );
}

export default App;