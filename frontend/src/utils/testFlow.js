// Test utilities for complete user flow testing

/**
 * Test the complete job tracking flow
 * This simulates the user journey from adding jobs to updating status
 */
export const testCompleteUserFlow = () => {
  console.log('🧪 Starting complete user flow test...');
  
  // Test data
  const testJobs = [
    {
      company: 'TechCorp',
      position: 'Frontend Developer',
      status: 'applied',
      location: 'San Francisco, CA',
      salary: '$120,000',
      description: 'React and TypeScript position',
      applicationDate: new Date().toISOString()
    },
    {
      company: 'StartupX',
      position: 'Full Stack Developer', 
      status: 'interviewing',
      location: 'New York, NY',
      salary: '$110,000',
      description: 'MERN stack development',
      applicationDate: new Date().toISOString()
    },
    {
      company: 'BigTech Inc',
      position: 'Senior React Developer',
      status: 'offer',
      location: 'Seattle, WA', 
      salary: '$150,000',
      description: 'Senior frontend role with React',
      applicationDate: new Date().toISOString()
    }
  ];

  return {
    testJobs,
    
    // Test adding jobs
    testAddJobs: (addJobFunction) => {
      console.log('📝 Testing job addition...');
      const addedJobs = [];
      
      testJobs.forEach((job, index) => {
        try {
          const newJob = addJobFunction(job);
          addedJobs.push(newJob);
          console.log(`✅ Added job ${index + 1}:`, newJob.company);
        } catch (error) {
          console.error(`❌ Failed to add job ${index + 1}:`, error);
        }
      });
      
      return addedJobs;
    },
    
    // Test status updates
    testStatusUpdates: (jobs, updateStatusFunction) => {
      console.log('🔄 Testing status updates...');
      const statusFlow = ['applied', 'interviewing', 'offer', 'accepted'];
      
      jobs.forEach((job, index) => {
        const newStatus = statusFlow[index % statusFlow.length];
        try {
          updateStatusFunction(job.id, newStatus);
          console.log(`✅ Updated ${job.company} status to:`, newStatus);
        } catch (error) {
          console.error(`❌ Failed to update status for ${job.company}:`, error);
        }
      });
    },
    
    // Test job editing
    testJobEditing: (jobs, updateJobFunction) => {
      console.log('✏️ Testing job editing...');
      
      if (jobs.length > 0) {
        const jobToEdit = jobs[0];
        const updates = {
          salary: '$130,000',
          notes: 'Updated salary after negotiation',
          location: 'Remote'
        };
        
        try {
          updateJobFunction(jobToEdit.id, updates);
          console.log(`✅ Updated job details for:`, jobToEdit.company);
        } catch (error) {
          console.error(`❌ Failed to edit job:`, error);
        }
      }
    },
    
    // Test job deletion
    testJobDeletion: (jobs, deleteJobFunction) => {
      console.log('🗑️ Testing job deletion...');
      
      if (jobs.length > 0) {
        const jobToDelete = jobs[jobs.length - 1];
        
        try {
          deleteJobFunction(jobToDelete.id);
          console.log(`✅ Deleted job:`, jobToDelete.company);
        } catch (error) {
          console.error(`❌ Failed to delete job:`, error);
        }
      }
    },
    
    // Test data persistence
    testDataPersistence: () => {
      console.log('💾 Testing data persistence...');
      
      try {
        const savedData = localStorage.getItem('jinderJobs');
        if (savedData) {
          const jobs = JSON.parse(savedData);
          console.log(`✅ Found ${jobs.length} jobs in localStorage`);
          return jobs;
        } else {
          console.log('ℹ️ No jobs found in localStorage');
          return [];
        }
      } catch (error) {
        console.error('❌ Failed to load from localStorage:', error);
        return [];
      }
    },
    
    // Test error handling
    testErrorHandling: (addJobFunction) => {
      console.log('⚠️ Testing error handling...');
      
      // Test with invalid data
      const invalidJob = {
        // Missing required fields
        company: '',
        position: ''
      };
      
      try {
        addJobFunction(invalidJob);
        console.log('⚠️ Should have thrown error for invalid job');
      } catch (error) {
        console.log('✅ Error handling working correctly:', error.message);
      }
    },
    
    // Run complete test suite
    runCompleteTest: (appFunctions) => {
      console.log('🚀 Running complete user flow test suite...');
      
      const {
        addJob,
        updateJob,
        updateJobStatus,
        deleteJob
      } = appFunctions;
      
      // Test sequence
      const addedJobs = testCompleteUserFlow().testAddJobs(addJob);
      testCompleteUserFlow().testStatusUpdates(addedJobs, updateJobStatus);
      testCompleteUserFlow().testJobEditing(addedJobs, updateJob);
      testCompleteUserFlow().testDataPersistence();
      testCompleteUserFlow().testErrorHandling(addJob);
      testCompleteUserFlow().testJobDeletion(addedJobs, deleteJob);
      
      console.log('🎉 Complete user flow test finished!');
    }
  };
};

// Performance testing
export const testPerformance = () => {
  console.log('⚡ Testing performance...');
  
  const startTime = performance.now();
  
  // Simulate adding many jobs
  const jobs = [];
  for (let i = 0; i < 1000; i++) {
    jobs.push({
      id: i.toString(),
      company: `Company ${i}`,
      position: `Position ${i}`,
      status: 'applied'
    });
  }
  
  const endTime = performance.now();
  console.log(`✅ Created 1000 jobs in ${endTime - startTime}ms`);
  
  return jobs;
};

// Export test runner
export default {
  testCompleteUserFlow,
  testPerformance
};