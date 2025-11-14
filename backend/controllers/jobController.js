const { db } = require('../config/firebase');

exports.createJob = async (req, res) => {
  try {
    const companyId = req.user.userId;
    const { title, description, requirements, qualifications, deadline, location, salary, jobType } = req.body;

    const jobRef = await db.collection('jobs').add({
      companyId,
      title,
      description,
      requirements: requirements || {},
      qualifications: qualifications || [],
      location,
      salary,
      jobType: jobType || 'full-time',
      deadline: new Date(deadline),
      status: 'active',
      createdAt: new Date()
    });

    res.status(201).json({ 
      message: 'Job posted successfully', 
      jobId: jobRef.id 
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobsSnapshot = await db.collection('jobs')
      .where('status', '==', 'active')
      .get();
    
    const jobs = [];
    for (const doc of jobsSnapshot.docs) {
      const job = doc.data();
      
      // Get company details
      let company = { name: 'Unknown Company' };
      try {
        const companyDoc = await db.collection('companies').doc(job.companyId).get();
        if (companyDoc.exists) {
          company = companyDoc.data();
        }
      } catch (companyError) {
        console.error('Error fetching company:', companyError);
      }
      
      jobs.push({
        id: doc.id,
        ...job,
        company: company
      });
    }

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.userId;

    // Check if job exists
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobDoc.data();
    
    // Check if job is still active and deadline not passed
    if (job.status !== 'active') {
      return res.status(400).json({ error: 'Job is no longer accepting applications' });
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({ error: 'Job application deadline has passed' });
    }

    // Check if already applied
    const existingApplication = await db.collection('jobApplications')
      .where('jobId', '==', jobId)
      .where('studentId', '==', studentId)
      .get();

    if (!existingApplication.empty) {
      return res.status(400).json({ 
        error: 'You have already applied for this job' 
      });
    }

    // Create job application (skip transcript check for now)
    await db.collection('jobApplications').add({
      jobId,
      studentId,
      status: 'pending',
      matchScore: 0, // Simple implementation for now
      matchedQualifications: [],
      appliedAt: new Date()
    });

    res.json({ 
      message: 'Job application submitted successfully',
      matchScore: 0
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to check job qualifications
function checkJobQualifications(student, job) {
  let matchScore = 0;
  const matchedQualifications = [];

  // Simple matching logic
  if (student.education && job.requirements) {
    if (student.education.degreeLevel && job.requirements.educationLevel) {
      matchScore += 30;
      matchedQualifications.push(job.requirements.educationLevel);
    }
  }

  return { matchScore, matchedQualifications };
}

exports.getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.user.userId;

    const jobsSnapshot = await db.collection('jobs')
      .where('companyId', '==', companyId)
      .get();
    
    const jobs = [];
    for (const doc of jobsSnapshot.docs) {
      const job = doc.data();
      
      // Get applications count for each job
      const applicationsSnapshot = await db.collection('jobApplications')
        .where('jobId', '==', doc.id)
        .get();

      jobs.push({
        id: doc.id,
        ...job,
        applicationCount: applicationsSnapshot.size
      });
    }

    res.json(jobs);
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user.userId;

    // Verify job belongs to company
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists || jobDoc.data().companyId !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const applicationsSnapshot = await db.collection('jobApplications')
      .where('jobId', '==', jobId)
      .get();
    
    const applicants = [];
    for (const doc of applicationsSnapshot.docs) {
      const application = doc.data();
      
      // Get student details
      const studentDoc = await db.collection('students').doc(application.studentId).get();
      const student = studentDoc.data();

      // Get user email
      const userDoc = await db.collection('users').doc(application.studentId).get();
      const user = userDoc.data();

      applicants.push({
        id: doc.id,
        ...application,
        student: {
          id: studentDoc.id,
          email: user?.email || 'No email',
          ...student
        }
      });
    }

    // Sort by match score (highest first)
    applicants.sort((a, b) => b.matchScore - a.matchScore);

    res.json(applicants);
  } catch (error) {
    console.error('Get job applicants error:', error);
    res.status(500).json({ error: error.message });
  }
};