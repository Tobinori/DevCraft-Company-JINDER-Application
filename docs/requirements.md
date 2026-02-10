# JINDER - Job Application Tracker Requirements

## Project Overview
JINDER is a job application tracking system that helps users manage their job search process efficiently. The application allows users to track job applications, monitor their status, and analyze their job search progress.

## User Stories

### Epic 1: Job Management

#### US-001: Add New Job Application
**As a** job seeker  
**I want to** add new job applications with detailed information  
**So that** I can track all my applications in one place  

**Acceptance Criteria:**
- User can input company name (required)
- User can input position title (required)
- User can input salary range or expected salary
- User can set initial application status (default: "Applied")
- User can add job description/notes
- User can input application date (defaults to current date)
- User can add job posting URL
- User can specify job location
- Form validation prevents submission with missing required fields
- Success message confirms job addition

#### US-002: View Job Applications List
**As a** job seeker  
**I want to** view all my job applications in an organized list  
**So that** I can quickly see my application status  

**Acceptance Criteria:**
- Display jobs in a table/card format
- Show company name, position, salary, status, and application date
- Default sort by application date (newest first)
- Show total number of applications
- Empty state message when no jobs exist
- Responsive design for mobile and desktop

#### US-003: Filter and Search Jobs
**As a** job seeker  
**I want to** filter and search my job applications  
**So that** I can quickly find specific applications  

**Acceptance Criteria:**
- Filter by application status (Applied/Interview/Offer/Rejected)
- Filter by salary range
- Search by company name or position title
- Filter by date range
- Clear all filters option
- Show count of filtered results
- Filters persist during session

#### US-004: Update Application Status
**As a** job seeker  
**I want to** update the status of my job applications  
**So that** I can track my progress through the hiring process  

**Acceptance Criteria:**
- Status options: Applied, Interview Scheduled, Interview Completed, Offer Received, Rejected, Withdrawn
- Quick status update from list view
- Detailed edit form for additional information
- Status change timestamps are recorded
- Visual indicators for different statuses
- Confirmation before status change

#### US-005: Edit Job Details
**As a** job seeker  
**I want to** edit job application details  
**So that** I can keep information accurate and up-to-date  

**Acceptance Criteria:**
- Edit all job fields except creation date
- Form pre-populated with existing data
- Validation on required fields
- Save changes confirmation
- Cancel option returns to previous state
- Edit history/audit trail

#### US-006: Delete Job Applications
**As a** job seeker  
**I want to** delete job applications  
**So that** I can remove irrelevant or duplicate entries  

**Acceptance Criteria:**
- Delete confirmation dialog
- Soft delete with recovery option (optional)
- Bulk delete functionality
- Cannot delete jobs with offers (business rule)

### Epic 2: Analytics and Reporting

#### US-007: View Application Analytics
**As a** job seeker  
**I want to** see analytics about my job search  
**So that** I can understand my job search patterns and success rate  

**Acceptance Criteria:**
- Total applications count
- Applications by status (pie chart or bar chart)
- Success rate calculation (offers/total applications)
- Average time between application and response
- Applications per week/month trends
- Top companies applied to
- Salary range distribution

#### US-008: Export Data
**As a** job seeker  
**I want to** export my job application data  
**So that** I can backup my data or use it in other tools  

**Acceptance Criteria:**
- Export to CSV format
- Export to PDF report
- Include all job fields
- Filter data before export
- Email export option

## UI Mockup Descriptions

### Dashboard/Home Page
- **Header**: JINDER logo, navigation menu, user profile
- **Summary Cards**: Total jobs (4), Pending interviews (2), Offers received (1), Rejected (1)
- **Quick Actions**: "Add New Job" prominent button
- **Recent Activity**: Last 5 job updates with timestamps
- **Charts**: Status distribution pie chart, applications over time line chart

### Job List Page
- **Header**: Page title "My Applications", Add Job button
- **Filters Section**: Status dropdown, salary range slider, date picker, search bar
- **Jobs Table/Grid**:
  - Company logo (if available) or placeholder
  - Company name and position title
  - Salary range
  - Status badge (color-coded)
  - Application date
  - Action buttons (Edit, Delete, Quick Status Change)
- **Pagination**: If more than 20 jobs
- **Bulk Actions**: Select multiple, bulk status update, bulk delete

### Add/Edit Job Form
- **Modal or dedicated page**
- **Required fields**: Company name*, Position title*
- **Optional fields**: Salary, Job description, URL, Location, Notes
- **Status dropdown**: Default "Applied"
- **Date picker**: Application date
- **Form validation**: Real-time validation messages
- **Actions**: Save, Cancel, Save & Add Another

### Analytics Page
- **KPI Cards**: Success rate, avg response time, total applications
- **Charts Section**:
  - Status distribution (donut chart)
  - Applications timeline (line chart)
  - Salary distribution (histogram)
- **Tables**: Top companies, longest pending applications
- **Export Options**: CSV, PDF buttons

### Mobile Responsive Design
- **Collapsible navigation menu**
- **Card-based layout** for job listings
- **Swipe actions** for quick status updates
- **Bottom sheet modals** for forms
- **Touch-friendly buttons** and form elements

## Technical Requirements

### Frontend Requirements
- **Framework**: React.js with TypeScript
- **State Management**: Redux Toolkit or Zustand
- **UI Library**: Material-UI or Tailwind CSS
- **Charts**: Chart.js or D3.js
- **Form Handling**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

### Backend Requirements
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **API**: RESTful API with OpenAPI documentation
- **Validation**: Joi or Zod
- **Testing**: Jest + Supertest
- **Environment**: Docker containers

### Database Schema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  position_title VARCHAR(255) NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  status VARCHAR(50) DEFAULT 'Applied',
  job_description TEXT,
  job_url VARCHAR(500),
  location VARCHAR(255),
  notes TEXT,
  application_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

#### Jobs
- `GET /api/jobs` - List jobs with filters and pagination
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `PATCH /api/jobs/:id/status` - Update job status
- `GET /api/jobs/export` - Export jobs data

#### Analytics
- `GET /api/analytics/summary` - Get summary statistics
- `GET /api/analytics/status-distribution` - Status breakdown
- `GET /api/analytics/timeline` - Applications over time
- `GET /api/analytics/salary-stats` - Salary statistics

### Non-Functional Requirements

#### Performance
- Page load time < 2 seconds
- API response time < 500ms for standard queries
- Support 100+ concurrent users
- Efficient database queries with proper indexing

#### Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting on API endpoints
- Secure password hashing (bcrypt)
- HTTPS enforcement

#### Scalability
- Horizontal scaling capability
- Database connection pooling
- Caching strategy (Redis)
- CDN for static assets

#### Usability
- Intuitive user interface
- Responsive design (mobile-first)
- Accessibility compliance (WCAG 2.1)
- Loading states and error handling
- Offline capability (basic)

#### Reliability
- 99.9% uptime target
- Automated backups
- Error logging and monitoring
- Graceful error handling
- Data validation at multiple layers

### Development Standards
- **Code Style**: ESLint + Prettier
- **Git Flow**: Feature branches with PR reviews
- **Documentation**: JSDoc for functions, README for setup
- **Testing**: Minimum 80% code coverage
- **CI/CD**: GitHub Actions for testing and deployment
- **Environment Management**: Development, staging, production

### Deployment Requirements
- **Containerization**: Docker and Docker Compose
- **Cloud Platform**: AWS, Google Cloud, or similar
- **Database**: Managed PostgreSQL service
- **Monitoring**: Application and infrastructure monitoring
- **Logging**: Centralized logging system
- **Backup Strategy**: Daily automated backups with 30-day retention

## Success Metrics
- User engagement: Daily active users
- Feature adoption: Percentage of users using analytics
- Performance: Average page load time
- Quality: Bug reports per release
- User satisfaction: User feedback scores

## Future Enhancements (Out of Scope)
- Team collaboration features
- Advanced reporting and insights
- Integration with job boards (LinkedIn, Indeed)
- Mobile app (iOS/Android)
- AI-powered job recommendations
- Calendar integration for interviews
- Email templates for follow-ups
- Salary negotiation tools