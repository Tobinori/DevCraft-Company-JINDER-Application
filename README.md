# 🎯 JINDER - Job Matching Platform

> A modern job matching platform that connects job seekers with employers through an intuitive swiping interface, similar to dating apps but for career opportunities.

## 📋 Project Description

JINDER revolutionizes the job search experience by providing a Tinder-like interface for job matching. Job seekers can swipe through job opportunities, while employers can review candidate profiles. The platform uses intelligent matching algorithms to connect the right candidates with the right opportunities.

## ✨ Features

### For Job Seekers
- 👤 **Profile Creation**: Build comprehensive professional profiles
- 📱 **Swipe Interface**: Swipe right to like jobs, left to pass
- 🔍 **Smart Matching**: AI-powered job recommendations based on skills and preferences
- 💼 **Application Tracking**: Monitor application status and responses
- 📊 **Analytics Dashboard**: Track profile views and match statistics
- 🔔 **Real-time Notifications**: Instant alerts for matches and messages

### For Employers
- 🏢 **Company Profiles**: Showcase company culture and values
- 📝 **Job Posting**: Create detailed job listings with requirements
- 👥 **Candidate Review**: Browse and evaluate potential candidates
- 💬 **Direct Messaging**: Communicate directly with matched candidates
- 📈 **Hiring Analytics**: Track job posting performance and candidate engagement

### Platform Features
- 🔐 **Secure Authentication**: JWT-based user authentication
- 📱 **Responsive Design**: Optimized for desktop and mobile devices
- ⚡ **Real-time Updates**: Live notifications and messaging
- 🎨 **Modern UI/UX**: Clean, intuitive interface design
- 🔒 **Data Privacy**: GDPR compliant data handling

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Query** - Data fetching and caching
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Lucide React** - Modern icon library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimal web framework
- **TypeScript** - Type-safe server development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Socket.io** - Real-time communication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-restart development server
- **Concurrently** - Run multiple commands

## 📁 Folder Structure

```
JINDER/
│
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Shared components (Header, Footer, etc.)
│   │   │   ├── forms/        # Form components
│   │   │   └── ui/           # Basic UI elements
│   │   ├── pages/            # Main application pages
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── jobs/         # Job-related pages
│   │   │   ├── profile/      # User profile pages
│   │   │   └── dashboard/    # Dashboard pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service functions
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript type definitions
│   │   └── styles/           # Global styles and themes
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
│
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database models (Mongoose)
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/       # Express middleware
│   │   ├── services/         # Business logic services
│   │   ├── utils/            # Utility functions
│   │   ├── config/           # Configuration files
│   │   └── types/            # TypeScript interfaces
│   ├── uploads/              # File upload directory
│   └── package.json          # Backend dependencies
│
├── docs/                     # Project documentation
├── .gitignore               # Git ignore file
├── README.md                # This file
└── package.json             # Root package.json for scripts
```

## 🚀 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JINDER
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/jinder
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```
   
   Create `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm start
   ```
   ✅ Backend will run on `http://localhost:5000`

2. **Start Frontend Development Server** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```
   ✅ Frontend will run on `http://localhost:3000`

### Production Mode

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Production Server**
   ```bash
   cd backend
   npm run prod
   ```

## 🎬 Demo Walkthrough

### For Trainees and Demo Setup

#### Quick Start (5 minutes)
1. Follow installation steps above
2. Start both backend and frontend servers
3. Open `http://localhost:3000` in your browser
4. You're ready to demo!

#### Demo Scenario 1: Job Seeker Journey
1. **Registration/Login**
   - Navigate to registration page
   - Create a job seeker account
   - Complete profile setup with skills and preferences

2. **Job Swiping**
   - Access the main swiping interface
   - Demonstrate swiping right (like) and left (pass)
   - Show how matches are created

3. **Profile Management**
   - Edit profile information
   - Update skills and job preferences
   - View application history

#### Demo Scenario 2: Employer Journey
1. **Company Setup**
   - Register as an employer
   - Create company profile
   - Add company details and culture information

2. **Job Posting**
   - Create a new job posting
   - Set requirements and job details
   - Publish the job

3. **Candidate Review**
   - Browse matched candidates
   - Review candidate profiles
   - Initiate conversations

#### Demo Scenario 3: Matching System
1. **Show Algorithm**
   - Explain how matching works
   - Demonstrate skill-based recommendations
   - Show mutual interest notifications

2. **Real-time Features**
   - Demonstrate live notifications
   - Show instant messaging
   - Display real-time updates

### Demo Tips for Presenters
- 🎯 **Focus on User Experience**: Highlight the intuitive swiping mechanism
- 📱 **Show Responsiveness**: Demonstrate mobile and desktop views
- ⚡ **Emphasize Speed**: Show how quickly users can browse opportunities
- 🤝 **Highlight Matching**: Explain the mutual interest concept
- 📊 **Show Analytics**: Display user engagement metrics

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

### End-to-End Testing
```bash
npm run test:e2e
```

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in deployment platform

### Backend Deployment (Heroku/Railway)
1. Push to your deployment platform
2. Set environment variables
3. Ensure MongoDB connection is configured

## 📚 API Documentation

Once the backend is running, API documentation is available at:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Postman Collection**: Available in `/docs` folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Mike Chen** - Senior Developer
- **Sarah Johnson** - UI/UX Designer
- **Alex Rodriguez** - Project Manager

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify environment variables in `.env`
- Ensure port 5000 is not in use

**Frontend build fails:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors
- Verify environment variables

**Database connection issues:**
- Confirm MongoDB URI is correct
- Check network connectivity
- Verify database permissions

### Getting Help

- 📧 Email: support@jinder.dev
- 💬 Discord: [Join our community](https://discord.gg/jinder)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**Happy Job Matching! 🎯✨**