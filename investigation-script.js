// Investigation Script for Issue #21 - Demo Not Working
// This script helps identify project structure and potential issues

const fs = require('fs');
const path = require('path');

// Check project structure
function investigateProjectStructure() {
  const findings = {
    frontend: [],
    backend: [],
    config: [],
    missing: [],
    issues: []
  };

  // Expected files for a JINDER project
  const expectedFiles = [
    'frontend/index.html',
    'frontend/app.js',
    'frontend/styles.css',
    'backend/server.js',
    'backend/package.json',
    'config/database.js',
    'README.md',
    'package.json'
  ];

  expectedFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const category = file.includes('frontend') ? 'frontend' : 
                      file.includes('backend') ? 'backend' : 'config';
      findings[category].push(file);
    } else {
      findings.missing.push(file);
    }
  });

  return findings;
}

// Check for common demo issues
function checkDemoIssues() {
  const issues = [];

  // Check if package.json exists and has required dependencies
  if (!fs.existsSync('package.json')) {
    issues.push('Missing package.json - cannot install dependencies');
  }

  // Check for frontend files
  if (!fs.existsSync('frontend/index.html')) {
    issues.push('Missing frontend/index.html - no UI to display');
  }

  // Check for backend server
  if (!fs.existsSync('backend/server.js')) {
    issues.push('Missing backend/server.js - no API server');
  }

  // Check for database config
  if (!fs.existsSync('config/database.js')) {
    issues.push('Missing database configuration');
  }

  return issues;
}

// Generate investigation report
function generateReport() {
  const structure = investigateProjectStructure();
  const issues = checkDemoIssues();

  return {
    timestamp: new Date().toISOString(),
    projectStructure: structure,
    criticalIssues: issues,
    recommendations: [
      'Set up basic project structure',
      'Create frontend components',
      'Implement backend API',
      'Configure database connection',
      'Add proper error handling'
    ]
  };
}

module.exports = { investigateProjectStructure, checkDemoIssues, generateReport };