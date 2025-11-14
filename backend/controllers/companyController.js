const { db } = require('../config/firebase');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, industry, description, contact, website, logo, size } = req.body;

    // Create update data with only the fields that are provided
    const updateData = {
      updatedAt: new Date()
    };

    // Only add fields that are provided in the request
    if (name !== undefined) updateData.name = name;
    if (industry !== undefined) updateData.industry = industry;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (logo !== undefined) updateData.logo = logo;
    if (size !== undefined) updateData.size = size;
    if (contact !== undefined) updateData.contact = contact || {};

    await db.collection('companies').doc(userId).update(updateData);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ALL THE REST OF YOUR CODE STAYS EXACTLY THE SAME
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const companyDoc = await db.collection('companies').doc(userId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const companyData = companyDoc.data();

    // Get jobs posted by this company
    const jobsSnapshot = await db.collection('jobs')
      .where('companyId', '==', userId)
      .get();

    const jobs = [];
    jobsSnapshot.forEach(doc => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get total applications across all jobs
    let totalApplications = 0;
    for (const job of jobs) {
      const applicationsSnapshot = await db.collection('jobApplications')
        .where('jobId', '==', job.id)
        .get();
      totalApplications += applicationsSnapshot.size;
    }

    res.json({
      ...companyData,
      stats: {
        totalJobs: jobs.length,
        totalApplications,
        activeJobs: jobs.filter(job => job.status === 'active').length
      },
      jobs
    });
  } catch (error) {
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

      // Get student's user details
      const userDoc = await db.collection('users').doc(application.studentId).get();
      const user = userDoc.data();

      applicants.push({
        id: doc.id,
        ...application,
        student: {
          id: studentDoc.id,
          email: user.email,
          ...student
        }
      });
    }

    // Sort by match score (highest first)
    applicants.sort((a, b) => b.matchScore - a.matchScore);

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const applicationDoc = await db.collection('jobApplications').doc(applicationId).get();
    if (!applicationDoc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = applicationDoc.data();
    
    // Verify company owns this job application
    const jobDoc = await db.collection('jobs').doc(application.jobId).get();
    if (!jobDoc.exists || jobDoc.data().companyId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.collection('jobApplications').doc(applicationId).update({
      status,
      updatedAt: new Date()
    });

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const companyId = req.user.userId;

    // Get company jobs
    const jobsSnapshot = await db.collection('jobs')
      .where('companyId', '==', companyId)
      .get();

    let totalApplications = 0;
    let activeJobs = 0;
    const jobs = [];

    for (const doc of jobsSnapshot.docs) {
      const job = doc.data();
      jobs.push({
        id: doc.id,
        ...job
      });

      if (job.status === 'active') {
        activeJobs++;
      }

      // Count applications for this job
      const applicationsSnapshot = await db.collection('jobApplications')
        .where('jobId', '==', doc.id)
        .get();
      totalApplications += applicationsSnapshot.size;
    }

    // Get recent applications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplicationsSnapshot = await db.collection('jobApplications')
      .where('appliedAt', '>=', thirtyDaysAgo)
      .get();

    const recentApplications = [];
    for (const doc of recentApplicationsSnapshot.docs) {
      const application = doc.data();
      
      // Check if application is for this company's job
      const jobDoc = await db.collection('jobs').doc(application.jobId).get();
      if (jobDoc.exists && jobDoc.data().companyId === companyId) {
        const studentDoc = await db.collection('students').doc(application.studentId).get();
        recentApplications.push({
          id: doc.id,
          ...application,
          student: studentDoc.data(),
          job: jobDoc.data()
        });
      }
    }

    res.json({
      stats: {
        totalJobs: jobs.length,
        activeJobs,
        totalApplications,
        recentApplications: recentApplications.length
      },
      recentApplications: recentApplications.slice(0, 5), // Last 5 applications
      jobs: jobs // Include jobs in response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};