# JINDER - Job Matching Platform

A modern job matching application that connects job seekers with potential employers through an intuitive interface.

## Project Structure

```
jinder/
├── backend/          # Express.js API server
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   ├── .env.example  # Environment variables template
│   └── .gitignore    # Backend gitignore
├── frontend/         # React.js application
│   └── package.json  # Frontend dependencies
└── README.md         # This file
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The backend server will run on http://localhost:3001

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend application will run on http://localhost:3000

## Features

- **Backend**: Express.js server with CORS and body-parser middleware
- **Frontend**: React.js application with routing support
- **API**: RESTful API design
- **Development**: Hot reload for both frontend and backend

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Technology Stack

### Backend
- Node.js
- Express.js
- CORS middleware
- Body-parser middleware

### Frontend
- React.js 18
- React Router DOM
- Axios for API calls

## Development Workflow

1. Start backend server: `cd backend && npm run dev`
2. Start frontend server: `cd frontend && npm start`
3. Access the application at http://localhost:3000
4. API requests will be proxied to http://localhost:3001

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details