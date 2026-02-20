# JINDER - Job Application Tracker
## Project Requirements Document

### Table of Contents
1. [Project Overview](#project-overview)
2. [User Personas](#user-personas)
3. [Core Features](#core-features)
4. [Technical Requirements](#technical-requirements)
5. [Acceptance Criteria](#acceptance-criteria)
6. [UI/UX Specifications](#uiux-specifications)
7. [Data Models](#data-models)
8. [API Endpoints](#api-endpoints)

---

## Project Overview

**JINDER** is a modern job application tracking system designed to help job seekers manage their application process efficiently. The platform allows users to track job applications, manage interview schedules, store notes, and monitor application statuses in one centralized location.

### Vision Statement
To simplify and streamline the job search process by providing an intuitive, comprehensive tool that helps job seekers stay organized and increase their chances of landing their dream job.

### Success Metrics
- User engagement: 80% of users return within 7 days
- Application completion rate: 90% of started applications are saved
- User satisfaction: 4.5/5 rating
- Performance: Page load times under 2 seconds

---

## User Personas

### Primary Persona: Alex Thompson - Recent Graduate
**Demographics:**
- Age: 22-25
- Education: Bachelor's degree in Computer Science
- Location: Urban area
- Tech-savvy: High

**Goals:**
- Track multiple job applications across different companies
- Prepare for interviews with organized notes
- Monitor application progress and follow-up dates
- Maintain professional networking contacts

**Pain Points:**
- Losing track of which jobs they've applied to
- Forgetting important interview details
- Missing follow-up opportunities
- Disorganized application materials

**User Story:** "As a recent graduate, I want to track all my job applications in one place so that I can stay organized and never miss a follow-up opportunity."

### Secondary Persona: Maria Rodriguez - Career Changer
**Demographics:**
- Age: 30-40
- Previous experience in different field
- Moderate tech proficiency
- Balancing job search with current employment

**Goals:**
- Efficiently manage job search while working full-time
- Track skill requirements for target roles
- Organize networking contacts and referrals
- Monitor salary negotiations and benefits

**Pain Points:**
- Limited time for job searching
- Need to be discreet about job search activities
- Tracking multiple career paths simultaneously
- Keeping application materials updated

**User Story:** "As a career changer, I need a discrete and efficient way to track my job applications so I can manage my search while maintaining my current position."

---

## Core Features

### 1. Job Application Management
**Description:** Central hub for managing all job applications

**Key Components:**
- Add new job applications with company details
- Edit and update existing applications
- Delete applications
- Bulk import from job boards (future enhancement)

**User Stories:**
- "As a user, I want to add a new job application so I can track it in my dashboard"
- "As a user, I want to edit application details so I can keep information current"
- "As a user, I want to delete applications so I can remove irrelevant entries"

### 2. Status Management System
**Description:** Track application progress through different stages

**Status Categories:**
- Applied
- Under Review
- Phone Screen Scheduled
- Phone Screen Completed
- Technical Interview Scheduled
- Technical Interview Completed
- Final Interview Scheduled
- Final Interview Completed
- Offer Received
- Offer Accepted
- Rejected
- Withdrawn

**Key Components:**
- Status dropdown selection
- Status history tracking
- Automated status change notifications
- Visual status indicators

**User Stories:**
- "As a user, I want to update application status so I can track progress"
- "As a user, I want to see status history so I can review the timeline"
- "As a user, I want visual status indicators so I can quickly assess my pipeline"

### 3. Notes and Documentation
**Description:** Comprehensive note-taking system for each application

**Note Types:**
- Interview notes
- Company research
- Salary negotiations
- Follow-up reminders
- General observations

**Key Components:**
- Rich text editor for formatting
- Timestamp tracking
- Note categorization
- Search functionality within notes
- Attachment support (future enhancement)

**User Stories:**
- "As a user, I want to add notes to applications so I can remember important details"
- "As a user, I want to search my notes so I can quickly find specific information"
- "As a user, I want to categorize notes so I can organize different types of information"

### 4. Dashboard and Analytics
**Description:** Visual overview of job search progress and metrics

**Key Components:**
- Application status overview
- Weekly/monthly application trends
- Response rate analytics
- Interview success rates
- Average time in each status

**User Stories:**
- "As a user, I want to see my application pipeline so I can understand my progress"
- "As a user, I want to track my response rates so I can improve my approach"
- "As a user, I want to see trends over time so I can adjust my strategy"

### 5. Contact Management
**Description:** Manage contacts and networking relationships

**Key Components:**
- Add company contacts (recruiters, hiring managers, employees)
- Link contacts to specific applications
- Contact interaction history
- Networking follow-up reminders

**User Stories:**
- "As a user, I want to save contact information so I can maintain professional relationships"
- "As a user, I want to link contacts to applications so I can track communications"
- "As a user, I want follow-up reminders so I don't miss networking opportunities"

---

## Technical Requirements

### Frontend Technology Stack
**Primary Framework:** React.js (v18+)
- **Routing:** React Router v6
- **State Management:** Redux Toolkit or React Context
- **UI Components:** Material-UI (MUI) or styled-components
- **Forms:** React Hook Form with Yup validation
- **HTTP Client:** Axios
- **Charts/Analytics:** Chart.js or Recharts
- **Date Handling:** date-fns or Day.js

**Development Tools:**
- Create React App or Vite for project setup
- ESLint and Prettier for code quality
- Jest and React Testing Library for testing

### Backend Technology Stack
**Primary Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi or express-validator
- **Security:** helmet, cors, bcryptjs
- **Logging:** Winston or Morgan
- **Environment:** dotenv for configuration

**Development Tools:**
- Nodemon for development
- Jest and Supertest for API testing
- MongoDB Memory Server for test database

### Database Requirements
**Primary Database:** MongoDB
- **Hosting:** MongoDB Atlas (cloud) or local MongoDB instance
- **Backup Strategy:** Daily automated backups
- **Performance:** Indexed queries for optimal performance
- **Security:** Role-based access control

### Infrastructure Requirements
**Hosting:**
- Frontend: Netlify, Vercel, or AWS S3/CloudFront
- Backend: Heroku, AWS EC2, or DigitalOcean
- Database: MongoDB Atlas

**Performance Requirements:**
- Page load time: < 2 seconds
- API response time: < 500ms for standard operations
- Database queries: < 100ms for indexed queries
- Concurrent users: Support 100+ simultaneous users

**Security Requirements:**
- HTTPS encryption for all communications
- JWT token expiration and refresh mechanisms
- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration for cross-origin requests

---

## Acceptance Criteria

### Feature 1: Job Application Management

#### AC-1.1: Add New Job Application
**Given** a user is logged into JINDER
**When** they click "Add New Application" button
**Then** they should see a form with the following required fields:
- Company Name
- Job Title
- Application Date
- Job Description URL
- Initial Status (defaults to "Applied")

**And** optional fields:
- Salary Range
- Location
- Contact Person
- Application Deadline

**When** they submit the form with valid data
**Then** the application should be saved to the database
**And** they should be redirected to the application details page
**And** they should see a success notification

#### AC-1.2: Edit Existing Application
**Given** a user has existing job applications
**When** they click "Edit" on an application
**Then** they should see a pre-populated form with current data
**When** they modify any field and click "Save"
**Then** the changes should be saved to the database
**And** they should see an updated success notification
**And** the updated information should be displayed immediately

#### AC-1.3: Delete Application
**Given** a user wants to remove an application
**When** they click "Delete" on an application
**Then** they should see a confirmation modal with the message "Are you sure you want to delete this application? This action cannot be undone."
**When** they confirm deletion
**Then** the application should be removed from the database
**And** they should see a confirmation message
**And** the application should no longer appear in their dashboard

### Feature 2: Status Management System

#### AC-2.1: Update Application Status
**Given** a user has a job application
**When** they select a new status from the dropdown
**Then** the status should update immediately in the UI
**And** the change should be saved to the database
**And** a timestamp should be recorded for the status change
**And** the previous status should be stored in status history

#### AC-2.2: Status History Tracking
**Given** a user has updated an application status multiple times
**When** they view the application details
**Then** they should see a "Status History" section
**And** it should display all previous statuses with timestamps
**And** it should be ordered chronologically (newest first)
**And** it should show the duration spent in each status

#### AC-2.3: Visual Status Indicators
**Given** a user is viewing their dashboard
**When** they look at their application list
**Then** each application should have a color-coded status badge
**And** the colors should follow this scheme:
- Applied: Blue
- Under Review: Yellow
- Interview Scheduled: Orange
- Interview Completed: Purple
- Offer Received: Green
- Rejected: Red
- Withdrawn: Gray

### Feature 3: Notes and Documentation

#### AC-3.1: Add Notes to Applications
**Given** a user is viewing an application
**When** they click "Add Note"
**Then** they should see a text editor
**When** they type a note and click "Save"
**Then** the note should be saved with a timestamp
**And** it should appear in the notes section
**And** it should include the author's name and creation date

#### AC-3.2: Edit and Delete Notes
**Given** a user has created a note
**When** they hover over the note
**Then** they should see "Edit" and "Delete" options
**When** they edit a note and save
**Then** the updated note should be saved with an "edited" timestamp
**When** they delete a note with confirmation
**Then** the note should be permanently removed

#### AC-3.3: Search Notes
**Given** a user has multiple notes across applications
**When** they use the search function
**Then** they should be able to search by:
- Note content (partial matches)
- Application company name
- Date range
**And** search results should highlight matching text
**And** results should be sorted by relevance

### Feature 4: Dashboard and Analytics

#### AC-4.1: Application Pipeline Overview
**Given** a user has job applications
**When** they visit the dashboard
**Then** they should see:
- Total number of applications
- Applications by status (with counts)
- Recent activity feed (last 10 actions)
- Quick action buttons (Add Application, View All)

#### AC-4.2: Analytics Charts
**Given** a user has application data over time
**When** they view the analytics section
**Then** they should see:
- Applications submitted per week/month (line chart)
- Status distribution (pie chart)
- Response rate percentage
- Average time between application and first response
**And** all charts should be interactive with hover tooltips
**And** data should be filterable by date range

### Feature 5: User Authentication

#### AC-5.1: User Registration
**Given** a new user wants to create an account
**When** they fill out the registration form with:
- Valid email address
- Password (minimum 8 characters, including uppercase, lowercase, and number)
- Password confirmation
**Then** their account should be created
**And** they should receive a welcome email
**And** they should be automatically logged in
**And** they should be redirected to the onboarding flow

#### AC-5.2: User Login
**Given** an existing user wants to log in
**When** they provide valid credentials
**Then** they should be authenticated
**And** they should receive a JWT token
**And** they should be redirected to their dashboard
**And** their session should remain active for 24 hours

#### AC-5.3: Password Reset
**Given** a user forgot their password
**When** they click "Forgot Password" and enter their email
**Then** they should receive a password reset email
**When** they click the reset link and provide a new password
**Then** their password should be updated
**And** they should be able to log in with the new password

---

## UI/UX Specifications

### Design System

#### Color Palette
**Primary Colors:**
- Primary Blue: #2563EB (buttons, links, active states)
- Secondary Blue: #3B82F6 (hover states, secondary actions)
- Success Green: #10B981 (success messages, positive indicators)
- Warning Yellow: #F59E0B (warnings, pending states)
- Error Red: #EF4444 (errors, destructive actions)
- Neutral Gray: #6B7280 (text, borders, inactive states)

**Background Colors:**
- Primary Background: #FFFFFF
- Secondary Background: #F9FAFB
- Card Background: #FFFFFF with subtle shadow
- Header Background: #1F2937

#### Typography
**Font Family:** Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

**Font Scales:**
- H1: 32px, font-weight: 700 (page titles)
- H2: 24px, font-weight: 600 (section headers)
- H3: 20px, font-weight: 600 (subsection headers)
- Body: 16px, font-weight: 400 (main content)
- Small: 14px, font-weight: 400 (metadata, captions)
- Caption: 12px, font-weight: 400 (timestamps, helper text)

#### Spacing System
**Base Unit:** 8px
- XS: 4px (tight spacing)
- SM: 8px (default spacing)
- MD: 16px (comfortable spacing)
- LG: 24px (section spacing)
- XL: 32px (major section spacing)
- XXL: 48px (page section spacing)

### Layout Specifications

#### Header Navigation
**Structure:**
- Logo/Brand (left)
- Navigation menu (center): Dashboard, Applications, Analytics, Profile
- User profile dropdown (right): Settings, Logout

**Responsive Behavior:**
- Desktop: Full horizontal navigation
- Tablet: Collapsible menu icon
- Mobile: Hamburger menu with slide-out drawer

#### Dashboard Layout
**Grid System:**
- 12-column grid with responsive breakpoints
- Desktop: 4-column layout for cards
- Tablet: 2-column layout
- Mobile: Single column stack

**Key Sections:**
1. Quick stats cards (top row)
2. Recent applications table (main content)
3. Quick actions sidebar (right column on desktop)

#### Application List View
**Table Structure:**
- Company Name (sortable)
- Job Title (sortable)
- Status (filterable)
- Applied Date (sortable)
- Last Updated (sortable)
- Actions (Edit, Delete, View)

**Responsive Behavior:**
- Desktop: Full table view
- Tablet: Compact table with hidden columns
- Mobile: Card-based layout

**Filtering and Sorting:**
- Status filter dropdown
- Date range picker
- Search by company or job title
- Column sorting indicators
- Active filter badges

### Interactive Elements

#### Buttons
**Primary Button:**
- Background: Primary Blue (#2563EB)
- Hover: Darker blue (#1D4ED8)
- Padding: 12px 24px
- Border radius: 6px
- Font weight: 500

**Secondary Button:**
- Background: Transparent
- Border: 1px solid Primary Blue
- Hover: Light blue background (#EBF8FF)
- Same padding and radius as primary

**Destructive Button:**
- Background: Error Red (#EF4444)
- Hover: Darker red (#DC2626)
- Used for delete actions

#### Form Elements
**Input Fields:**
- Border: 1px solid #D1D5DB
- Focus: Border color changes to Primary Blue
- Padding: 12px 16px
- Border radius: 6px
- Error state: Red border with error message below

**Dropdown Selects:**
- Same styling as input fields
- Chevron down icon on the right
- Options list with hover states

**Date Pickers:**
- Calendar popup interface
- Today button for quick selection
- Clear button for optional dates

#### Status Badges
**Visual Design:**
- Pill-shaped (fully rounded corners)
- Padding: 4px 12px
- Font size: 12px
- Font weight: 500
- Colors as specified in status indicator requirements

### Responsive Design Specifications

#### Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

#### Mobile-First Approach
**Progressive Enhancement:**
1. Core functionality works on mobile
2. Enhanced features added for larger screens
3. Touch-friendly interactions on all screen sizes

**Mobile Optimizations:**
- Minimum tap target size: 44px x 44px
- Swipe gestures for table rows
- Pull-to-refresh functionality
- Optimized form inputs for mobile keyboards

### Accessibility Specifications

#### WCAG 2.1 AA Compliance
**Color Contrast:**
- Normal text: 4.5:1 minimum ratio
- Large text: 3:1 minimum ratio
- UI components: 3:1 minimum ratio

**Keyboard Navigation:**
- All interactive elements accessible via keyboard
- Visible focus indicators
- Logical tab order
- Skip links for main content

**Screen Reader Support:**
- Semantic HTML elements
- ARIA labels for complex interactions
- Alternative text for images
- Form labels properly associated

**Additional Features:**
- High contrast mode support
- Font size adjustment capabilities
- Reduced motion preferences respected

### Animation and Transitions

#### Micro-interactions
**Button Interactions:**
- Hover: 150ms ease-in-out transition
- Click: Subtle scale down (0.98) with 100ms duration

**Form Validation:**
- Error states: Shake animation (3 iterations, 100ms each)
- Success states: Subtle checkmark fade-in

**Loading States:**
- Skeleton screens for content loading
- Spinner animations for form submissions
- Progress indicators for multi-step processes

#### Page Transitions
- Fade-in: 200ms ease-out for new content
- Slide transitions: 300ms ease-in-out for modal dialogs
- No transitions longer than 500ms to maintain perceived performance

---

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  createdAt: Date (default: now),
  updatedAt: Date (default: now),
  lastLoginAt: Date,
  isActive: Boolean (default: true),
  preferences: {
    theme: String (enum: ['light', 'dark']),
    emailNotifications: Boolean (default: true),
    timezone: String (default: 'UTC')
  }
}
```

### Job Application Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  companyName: String (required),
  jobTitle: String (required),
  applicationDate: Date (required),
  status: String (enum: [
    'applied', 'under_review', 'phone_screen_scheduled',
    'phone_screen_completed', 'technical_interview_scheduled',
    'technical_interview_completed', 'final_interview_scheduled',
    'final_interview_completed', 'offer_received', 'offer_accepted',
    'rejected', 'withdrawn'
  ], default: 'applied'),
  jobDescriptionUrl: String,
  salaryRange: {
    min: Number,
    max: Number,
    currency: String (default: 'USD')
  },
  location: String,
  applicationDeadline: Date,
  contactPerson: String,
  notes: [{
    _id: ObjectId,
    content: String,
    createdAt: Date (default: now),
    updatedAt: Date (default: now),
    category: String (enum: ['interview', 'research', 'salary', 'followup', 'general'])
  }],
  statusHistory: [{
    status: String,
    changedAt: Date (default: now),
    note: String
  }],
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

### Contact Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  applicationId: ObjectId (ref: 'JobApplication'),
  name: String (required),
  email: String,
  phone: String,
  position: String,
  company: String,
  linkedIn: String,
  notes: String,
  lastContactDate: Date,
  nextFollowUpDate: Date,
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

---

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### User Management Endpoints
```
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/password
DELETE /api/users/account
```

### Job Application Endpoints
```
GET /api/applications
POST /api/applications
GET /api/applications/:id
PUT /api/applications/:id
DELETE /api/applications/:id
PUT /api/applications/:id/status
GET /api/applications/:id/status-history
```

### Notes Endpoints
```
GET /api/applications/:id/notes
POST /api/applications/:id/notes
PUT /api/applications/:applicationId/notes/:noteId
DELETE /api/applications/:applicationId/notes/:noteId
GET /api/notes/search
```

### Analytics Endpoints
```
GET /api/analytics/dashboard
GET /api/analytics/applications-over-time
GET /api/analytics/status-distribution
GET /api/analytics/response-rates
```

### Contact Endpoints
```
GET /api/contacts
POST /api/contacts
GET /api/contacts/:id
PUT /api/contacts/:id
DELETE /api/contacts/:id
```

---

## Development Guidelines

### Code Standards
- Use ESLint and Prettier for consistent formatting
- Follow conventional commit messages
- Write unit tests for all business logic
- Document all API endpoints with JSDoc
- Use TypeScript for type safety (optional but recommended)

### Git Workflow
- Feature branch workflow
- Pull request reviews required
- Automated testing before merge
- Semantic versioning for releases

### Testing Requirements
- Unit tests: 80% code coverage minimum
- Integration tests for all API endpoints
- End-to-end tests for critical user flows
- Performance testing for database queries

### Security Considerations
- Input validation on all endpoints
- Rate limiting for API calls
- CORS configuration
- Security headers implementation
- Regular dependency updates

---

## Future Enhancements

### Phase 2 Features
- Email integration for automatic application tracking
- Calendar integration for interview scheduling
- Resume and cover letter management
- Job board integration (LinkedIn, Indeed, etc.)
- Team collaboration features for career coaches

### Phase 3 Features
- AI-powered job matching
- Automated follow-up reminders
- Salary negotiation guidance
- Interview preparation tools
- Mobile app development

---

## Conclusion

This requirements document serves as the comprehensive guide for developing JINDER. All team members should refer to this document throughout the development process and update it as requirements evolve. For questions or clarifications, please reach out to the project team.

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Next Review:** [Date + 30 days]