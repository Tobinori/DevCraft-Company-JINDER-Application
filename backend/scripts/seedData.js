const mongoose = require('mongoose');
const Job = require('../models/Job');

// Sample job application data
const sampleJobs = [
  {
    company: 'Google',
    position: 'Software Engineer II',
    location: 'Mountain View, CA',
    salary: '$180,000 - $220,000',
    status: 'Interview',
    applicationDate: new Date('2024-01-15'),
    jobUrl: 'https://careers.google.com/jobs/123456',
    description: 'Join our team building next-generation web technologies. Work on large-scale distributed systems and user-facing products used by billions.',
    requirements: ['JavaScript', 'Python', 'System Design', 'Computer Science Degree'],
    notes: 'Completed phone screen, technical interview scheduled for next week. Interviewer seemed impressed with my React experience.',
    priority: 'High',
    contactPerson: 'Sarah Johnson - Engineering Recruiter',
    applicationMethod: 'Company Website'
  },
  {
    company: 'Microsoft',
    position: 'Frontend Developer',
    location: 'Seattle, WA',
    salary: '$165,000 - $195,000',
    status: 'Applied',
    applicationDate: new Date('2024-01-22'),
    jobUrl: 'https://careers.microsoft.com/jobs/987654',
    description: 'Build modern web applications using React, TypeScript, and Azure services. Collaborate with cross-functional teams to deliver high-quality user experiences.',
    requirements: ['React', 'TypeScript', 'Azure', '3+ years experience'],
    notes: 'Applied through LinkedIn. Position seems like a great fit for my React and TypeScript background.',
    priority: 'High',
    contactPerson: '',
    applicationMethod: 'LinkedIn'
  },
  {
    company: 'Startup Inc',
    position: 'Full Stack Engineer',
    location: 'San Francisco, CA',
    salary: '$140,000 - $160,000 + equity',
    status: 'Offer',
    applicationDate: new Date('2024-01-08'),
    jobUrl: 'https://startupinc.com/careers',
    description: 'Join our fast-growing fintech startup. Work on both frontend and backend systems, mentor junior developers, and help shape our technical direction.',
    requirements: ['Node.js', 'React', 'MongoDB', 'AWS'],
    notes: 'Received offer! $155k base + 0.5% equity. Really liked the team culture during interviews. Need to respond by Friday.',
    priority: 'High',
    contactPerson: 'Mark Thompson - CTO',
    applicationMethod: 'Company Website'
  },
  {
    company: 'Amazon',
    position: 'Software Development Engineer',
    location: 'Austin, TX',
    salary: '$170,000 - $200,000',
    status: 'Rejected',
    applicationDate: new Date('2024-01-03'),
    jobUrl: 'https://amazon.jobs/en/jobs/2345678',
    description: 'Work on large-scale e-commerce systems serving millions of customers. Focus on performance optimization and system reliability.',
    requirements: ['Java', 'Spring Boot', 'Microservices', 'System Design'],
    notes: 'Made it to final round but didn\'t get the offer. Feedback was that my system design could be stronger. Good learning experience.',
    priority: 'Medium',
    contactPerson: 'Jennifer Lee - Recruiting Coordinator',
    applicationMethod: 'Company Website'
  },
  {
    company: 'Spotify',
    position: 'Senior Frontend Engineer',
    location: 'New York, NY',
    salary: '$175,000 - $205,000',
    status: 'Interview',
    applicationDate: new Date('2024-01-18'),
    jobUrl: 'https://lifeatspotify.com/jobs/senior-frontend-engineer',
    description: 'Help build the future of music streaming. Work on user-facing features that impact millions of music lovers worldwide.',
    requirements: ['React', 'JavaScript', 'Web Performance', 'Music Industry Interest'],
    notes: 'Had great first interview discussing music recommendation algorithms. Technical challenge went well - waiting for next round.',
    priority: 'High',
    contactPerson: 'Alex Rivera - Senior Engineering Manager',
    applicationMethod: 'Referral'
  },
  {
    company: 'Netflix',
    position: 'Backend Engineer',
    location: 'Los Gatos, CA',
    salary: '$190,000 - $230,000',
    status: 'Applied',
    applicationDate: new Date('2024-01-25'),
    jobUrl: 'https://jobs.netflix.com/jobs/12345',
    description: 'Build and maintain microservices that power Netflix\'s content delivery platform. Work with cutting-edge technologies at massive scale.',
    requirements: ['Java', 'Microservices', 'Kafka', 'AWS', '5+ years experience'],
    notes: 'Dream job! Applied yesterday. Really hoping to hear back. Their tech stack aligns perfectly with my experience.',
    priority: 'High',
    contactPerson: '',
    applicationMethod: 'Company Website'
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jinder', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Job.deleteMany({});
    console.log('🗑️  Cleared existing job data');

    // Insert sample data
    const insertedJobs = await Job.insertMany(sampleJobs);
    console.log(`✅ Successfully seeded ${insertedJobs.length} job applications`);

    // Display summary
    console.log('\n📊 Seeded Data Summary:');
    console.log('Companies:', sampleJobs.map(job => job.company).join(', '));
    console.log('Statuses:', [...new Set(sampleJobs.map(job => job.status))].join(', '));
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();