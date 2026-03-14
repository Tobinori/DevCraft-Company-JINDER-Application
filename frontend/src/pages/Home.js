import React, { useEffect, useState } from 'react';
import './Home.css';

const Home = () => {
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    // Test API connection
    fetch('/api/health')
      .then(response => response.json())
      .then(data => setApiStatus(data))
      .catch(error => {
        console.error('API connection failed:', error);
        setApiStatus({ error: 'Failed to connect to backend' });
      });
  }, []);

  return (
    <div className="home">
      <div className="hero">
        <div className="container">
          <h1>Welcome to JINDER</h1>
          <p>The AI-powered job matching platform that connects you with your perfect career opportunity.</p>
          <div className="cta-buttons">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
          
          {/* API Status Display */}
          <div className="api-status">
            <h3>System Status</h3>
            {apiStatus ? (
              apiStatus.error ? (
                <div className="status error">
                  <span>❌ Backend: {apiStatus.error}</span>
                </div>
              ) : (
                <div className="status success">
                  <span>✅ Backend: {apiStatus.message}</span>
                  <small>Version: {apiStatus.version}</small>
                </div>
              )
            ) : (
              <div className="status loading">
                <span>⏳ Checking backend connection...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="features">
        <div className="container">
          <h2>How It Works</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>📝 Create Profile</h3>
              <p>Build your professional profile with skills, experience, and preferences.</p>
            </div>
            <div className="feature-card">
              <h3>🤖 AI Matching</h3>
              <p>Our AI analyzes your profile and matches you with relevant job opportunities.</p>
            </div>
            <div className="feature-card">
              <h3>👍 Swipe & Match</h3>
              <p>Swipe through job recommendations and connect with interested employers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;