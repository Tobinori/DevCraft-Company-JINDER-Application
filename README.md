# JINDER - AI-Powered Job Matching Platform

JINDER is an innovative job matching platform that uses AI to connect job seekers with relevant opportunities, similar to how dating apps work but for professional networking.

## 🚀 Project Structure

```
jinder/
├── README.md                 # Project documentation
├── package.json             # Root package.json with project scripts
├── .gitignore              # Git ignore rules
│
├── backend/                # Backend API (Node.js/Express)
│   ├── package.json        # Backend dependencies
│   ├── server.js          # Express server entry point
│   ├── config/            # Database and app configuration
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── controllers/       # Route controllers
│   └── utils/             # Utility functions
│
└── frontend/              # Frontend React App
    ├── package.json       # Frontend dependencies
    ├── public/            # Public assets
    └── src/               # React source code
        ├── components/    # Reusable components
        ├── pages/         # Page components
        ├── hooks/         # Custom React hooks
        ├── services/      # API services
        ├── utils/         # Utility functions
        ├── styles/        # CSS/styling files
        └── App.js         # Main App component
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jinder.git
   cd jinder
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` in the backend folder
   - Configure your MongoDB connection string
   - Set JWT secret and other environment variables

4. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts both backend (port 3001) and frontend (port 3000) concurrently.

### Individual Services

**Backend only:**
```bash
cd backend
npm install
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm install
npm start
```

## 📁 Directory Guidelines

### ⚠️ Important Structure Notes

- **NO `src/` folder in root directory** - This was causing conflicts
- Frontend React code belongs in `frontend/src/`
- Backend code belongs directly in `backend/`
- Keep clear separation between frontend and backend

### Backend Structure (`backend/`)
- `server.js` - Main server file
- `config/` - Database configuration, environment setup
- `models/` - Mongoose/Database models
- `routes/` - Express route definitions
- `controllers/` - Business logic for routes
- `middleware/` - Authentication, validation, etc.
- `utils/` - Helper functions

### Frontend Structure (`frontend/src/`)
- `components/` - Reusable UI components
- `pages/` - Main page components
- `hooks/` - Custom React hooks
- `services/` - API integration
- `utils/` - Frontend utilities
- `styles/` - CSS and styling

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend
```

## 🚀 Deployment

```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Follow the established directory structure
2. Keep backend and frontend code separated
3. Use meaningful commit messages
4. Write tests for new features
5. Update documentation as needed

## 📝 API Documentation

The backend API will be documented using Swagger/OpenAPI. Access documentation at:
`http://localhost:3001/api-docs` (when server is running)

## 🔧 Environment Variables

Create `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/jinder
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
```

## 📄 License

MIT License - see LICENSE file for details

---

**Team:** Mike Chen (Senior Developer), Sarah Johnson (UI/UX Designer), Jennifer Martinez (Project Manager)

**Last Updated:** December 2024