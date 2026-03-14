# JINDER - Job Application Tracker

## Overview
JINDER is a modern job application tracking system built with React frontend and Node.js backend. It helps users manage their job applications, track application status, and organize their job search process.

## Features
- Track job applications with status updates
- Store company information and job details
- Add notes and follow-up reminders
- Clean, intuitive user interface
- RESTful API backend

## Tech Stack
- **Frontend**: React, CSS3, Modern JavaScript
- **Backend**: Node.js, Express.js
- **Development**: Modern ES6+ features

## Project Structure
```
jinder/
├── backend/          # Node.js/Express API server
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   └── routes/       # API routes
├── frontend/         # React application
│   ├── src/          # React source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── docs/             # Documentation
└── README.md         # This file
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Server runs on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Application runs on http://localhost:3000

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

## Development Status
✅ Basic project structure
✅ Backend API with mock data
✅ Frontend React components
🔄 Integration testing
⏳ Production deployment

## Demo
This project includes sample data and is ready for demonstration. Follow the Quick Start guide to run locally.

---
**DevCraft Solutions** - Built for efficient job application tracking