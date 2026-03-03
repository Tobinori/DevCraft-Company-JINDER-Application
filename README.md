# JINDER - Job Matching Platform

> A modern job matching platform that connects job seekers with employers through an intuitive Tinder-like interface.

## 📋 Project Overview

JINDER revolutionizes the job search experience by providing a swipe-based matching system where:
- **Job Seekers** can swipe through job opportunities
- **Employers** can review and match with potential candidates
- **Smart Matching** algorithm suggests relevant opportunities
- **Real-time Chat** enables direct communication between matches

### Key Features
- 🎯 **Smart Job Matching** - AI-powered job recommendations
- 💬 **Real-time Messaging** - Instant communication between matches
- 👤 **Dual User Profiles** - Separate interfaces for job seekers and employers
- 📊 **Analytics Dashboard** - Track application success rates
- 🔍 **Advanced Filtering** - Location, salary, skills-based filtering
- 📱 **Mobile-First Design** - Responsive across all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jinder
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment (.env in backend/)
   cp backend/.env.example backend/.env
   
   # Configure your environment variables:
   MONGODB_URI=mongodb://localhost:27017/jinder
   JWT_SECRET=your-jwt-secret
   PORT=5000
   ```

4. **Start the application**
   ```bash
   # Start backend server (from backend/)
   npm start
   
   # Start frontend (from frontend/ in new terminal)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎯 Demo Walkthrough

### For Job Seekers
1. **Registration/Login** - Create account with professional details
2. **Profile Setup** - Upload resume, set preferences, skills
3. **Job Swiping** - Browse through job cards, swipe right to like
4. **Matches** - View mutual matches with employers
5. **Messaging** - Chat with interested employers
6. **Applications** - Track application status

### For Employers
1. **Company Registration** - Set up company profile
2. **Job Posting** - Create detailed job listings
3. **Candidate Review** - Browse candidate profiles
4. **Matching** - Connect with interested candidates
5. **Hiring Pipeline** - Manage recruitment process

## 🛠 API Endpoints

### Authentication
```http
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
GET    /api/auth/profile      # Get user profile
```

### Jobs
```http
GET    /api/jobs              # Get job listings
POST   /api/jobs              # Create new job (employers)
GET    /api/jobs/:id          # Get specific job
PUT    /api/jobs/:id          # Update job
DELETE /api/jobs/:id          # Delete job
```

### Matching
```http
POST   /api/matches/swipe     # Swipe on job/candidate
GET    /api/matches           # Get user matches
GET    /api/matches/:id       # Get specific match
```

### Messaging
```http
GET    /api/messages/:matchId # Get messages for match
POST   /api/messages          # Send new message
```

### Users
```http
GET    /api/users/profile     # Get user profile
PUT    /api/users/profile     # Update profile
POST   /api/users/upload      # Upload profile image/resume
```

## 🏗 Component Structure

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Shared components
│   │   ├── jobseeker/       # Job seeker specific
│   │   └── employer/        # Employer specific
│   ├── pages/               # Main application pages
│   │   ├── Auth/           # Login/Register
│   │   ├── Dashboard/      # User dashboards
│   │   ├── Jobs/           # Job browsing
│   │   ├── Matches/        # Match management
│   │   └── Messages/       # Chat interface
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React Context providers
│   ├── services/           # API service functions
│   ├── utils/              # Utility functions
│   └── styles/             # CSS/SCSS files
```

### Backend Architecture
```
backend/
├── controllers/            # Request handlers
├── models/                # Database schemas
├── routes/                # API route definitions
├── middleware/            # Custom middleware
├── services/              # Business logic
├── utils/                 # Helper functions
└── config/                # Configuration files
```

### Key Components

#### Frontend Components
- **SwipeCard** - Interactive job/candidate cards
- **MatchList** - Display matched connections
- **ChatWindow** - Real-time messaging interface
- **ProfileForm** - User profile management
- **JobForm** - Job posting interface
- **FilterPanel** - Advanced search filters

#### Backend Models
- **User** - User profiles (job seekers & employers)
- **Job** - Job postings
- **Match** - User-job connections
- **Message** - Chat messages
- **Company** - Employer company profiles

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

### Test Coverage
- Unit tests for all components
- Integration tests for API endpoints
- E2E tests for critical user flows

## 🔧 Troubleshooting

### Common Issues

#### 1. Application Won't Start
**Problem**: `npm start` fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Check Node.js version
node --version  # Should be v16+
```

#### 2. Database Connection Failed
**Problem**: MongoDB connection errors
**Solution**:
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify database exists and is accessible

#### 3. API Calls Failing
**Problem**: Frontend can't reach backend
**Solution**:
- Verify backend is running on port 5000
- Check CORS configuration
- Ensure API_URL is correctly set in frontend

#### 4. Authentication Issues
**Problem**: Login/logout not working
**Solution**:
```bash
# Clear browser storage
# Check JWT_SECRET in .env
# Verify token expiration settings
```

#### 5. File Upload Problems
**Problem**: Image/resume uploads fail
**Solution**:
- Check file size limits
- Verify upload directory permissions
- Ensure multer middleware is configured

#### 6. Real-time Features Not Working
**Problem**: Messages not updating in real-time
**Solution**:
- Check WebSocket connection
- Verify Socket.IO configuration
- Test with different browsers

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Backend debugging
NODE_ENV=development npm start

# Frontend debugging
REACT_APP_DEBUG=true npm start
```

### Performance Issues

#### Slow Loading
- Enable production build: `npm run build`
- Check network tab in developer tools
- Optimize images and assets
- Implement lazy loading for components

#### Memory Leaks
- Monitor React DevTools Profiler
- Check for unsubscribed event listeners
- Verify cleanup in useEffect hooks

## 📊 Demo Data

### Sample Users
```javascript
// Job Seeker
{
  email: "jobseeker@demo.com",
  password: "demo123",
  role: "jobseeker"
}

// Employer
{
  email: "employer@demo.com",
  password: "demo123",
  role: "employer"
}
```

### Load Demo Data
```bash
cd backend
npm run seed
```

## 🚀 Deployment

### Production Build
```bash
# Frontend production build
cd frontend
npm run build

# Backend production setup
cd backend
NODE_ENV=production npm start
```

### Environment Variables (Production)
```bash
NODE_ENV=production
MONGODB_URI=your-production-db
JWT_SECRET=secure-random-string
PORT=5000
CORS_ORIGIN=https://yourapp.com
```

## 📈 Performance Metrics

- **Load Time**: < 3 seconds
- **API Response**: < 500ms average
- **Mobile Performance**: 90+ Lighthouse score
- **Accessibility**: WCAG 2.1 AA compliant

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Demo Presentation Tips

### Key Demonstration Points
1. **User Registration Flow** - Show both job seeker and employer signup
2. **Profile Creation** - Demonstrate rich profile features
3. **Matching Algorithm** - Show how swiping creates matches
4. **Real-time Chat** - Demonstrate instant messaging
5. **Mobile Responsiveness** - Show app on different screen sizes
6. **Admin Features** - Show job posting and candidate management

### Impressive Features to Highlight
- Smooth swipe animations
- Real-time notifications
- Advanced filtering capabilities
- Professional UI/UX design
- Comprehensive matching system

---

**Built with ❤️ by the JINDER Team**

For questions or support, contact: support@jinder.com