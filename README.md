# 🔥 JINDER - AI-Powered Job Matching Platform

## Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation & Demo

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd jinder
   npm install
   ```

2. **Setup client:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Start the demo:**
   ```bash
   # Terminal 1: Start backend server
   npm start
   
   # Terminal 2: Start React client (in new terminal)
   cd client
   npm start
   ```

4. **Access the demo:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/api/health

### Demo Features

✅ **Working Features:**
- Job card swiping interface
- Sample job data display
- Responsive design
- API health monitoring
- Error handling

### Architecture

```
jinder/
├── server.js              # Express backend server
├── package.json           # Backend dependencies
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styling
│   │   └── index.js      # React entry point
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

### API Endpoints

- `GET /api/health` - Server health check
- `GET /api/jobs` - Fetch sample jobs

### Troubleshooting

**Common Issues:**

1. **Port conflicts:**
   - Backend uses port 5000
   - Frontend uses port 3000
   - Make sure these ports are available

2. **Dependencies:**
   ```bash
   # Clean install if issues
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build issues:**
   ```bash
   # For production build
   cd client && npm run build
   ```

### Development

- Backend runs with `nodemon` for auto-restart
- Frontend has hot-reload enabled
- API proxy configured in client package.json

### Next Steps

- [ ] Connect to MongoDB
- [ ] Add user authentication
- [ ] Implement AI matching algorithm
- [ ] Add real job data integration
- [ ] Deploy to production

---

**Demo Status: ✅ WORKING**

Last updated: $(date)
Contact: JINDER Development Team