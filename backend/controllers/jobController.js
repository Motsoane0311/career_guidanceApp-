const { db } = require('../config/firebase');

exports.createJob = async (req, res) => {
  try {
    const companyId = req.user.userId;
    const { 
      title, 
      description, 
      requirements, 
      qualifications, 
      deadline, 
      location, 
      salary, 
      jobType 
    } = req.body;

    // Enhanced job requirements with academic and experience requirements
    const enhancedRequirements = {
      // Academic requirements
      education: requirements?.education || {},
      minGPA: requirements?.minGPA || 0,
      requiredCourses: requirements?.requiredCourses || [],
      universityRequirements: requirements?.universityRequirements || {},
      
      // Experience requirements
      minExperience: requirements?.minExperience || 0,
      requiredSkills: requirements?.requiredSkills || [],
      certificates: requirements?.certificates || [],
      
      // Reference requirements
      requireReferences: requirements?.requireReferences || false,
      minReferences: requirements?.minReferences || 0,
      
      ...requirements
    };

    const jobRef = await db.collection('jobs').add({
      companyId,
      title,
      description,
      requirements: enhancedRequirements,
      qualifications: qualifications || [],
      location,
      salary,
      jobType: jobType || 'full-time',
      deadline: new Date(deadline),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
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
    const { 
      coverLetter, 
      workExperience, 
      references, 
      additionalDocuments 
    } = req.body;

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

    // Get student profile for evaluation
    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(400).json({ error: 'Student profile not found. Please complete your profile first.' });
    }

    const student = studentDoc.data();

    // Evaluate student against job requirements
    const evaluation = evaluateStudentForJob(student, job);

    // Create comprehensive job application
    const applicationRef = await db.collection('jobApplications').add({
      jobId,
      studentId,
      coverLetter: coverLetter || '',
      workExperience: workExperience || [],
      references: references || [],
      additionalDocuments: additionalDocuments || [],
      status: 'pending',
      matchScore: evaluation.matchScore,
      matchedQualifications: evaluation.matchedQualifications,
      evaluationDetails: evaluation,
      appliedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({ 
      message: 'Job application submitted successfully',
      matchScore: evaluation.matchScore,
      applicationId: applicationRef.id
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Enhanced evaluation function for job applications
function evaluateStudentForJob(student, job) {
  let matchScore = 0;
  const matchedQualifications = [];
  const evaluationDetails = {
    academicMatch: {},
    experienceMatch: {},
    skillMatch: {},
    missingRequirements: []
  };

  const requirements = job.requirements || {};

  // Academic Evaluation
  if (requirements.minGPA) {
    const studentGPA = student.education?.gpa || 0;
    if (studentGPA >= requirements.minGPA) {
      matchScore += 25;
      matchedQualifications.push(`Meets GPA requirement (${studentGPA} >= ${requirements.minGPA})`);
      evaluationDetails.academicMatch.gpa = { required: requirements.minGPA, actual: studentGPA, met: true };
    } else {
      evaluationDetails.academicMatch.gpa = { required: requirements.minGPA, actual: studentGPA, met: false };
      evaluationDetails.missingRequirements.push(`GPA below requirement (${studentGPA} < ${requirements.minGPA})`);
    }
  }

  // Education Level Evaluation
  if (requirements.education?.level) {
    const studentEducationLevel = student.education?.degreeLevel || '';
    if (studentEducationLevel === requirements.education.level) {
      matchScore += 15;
      matchedQualifications.push(`Education level: ${studentEducationLevel}`);
      evaluationDetails.academicMatch.educationLevel = { required: requirements.education.level, actual: studentEducationLevel, met: true };
    } else {
      evaluationDetails.academicMatch.educationLevel = { required: requirements.education.level, actual: studentEducationLevel, met: false };
    }
  }

  // Course Requirements Evaluation
  if (requirements.requiredCourses && requirements.requiredCourses.length > 0) {
    const studentCourses = student.education?.academicRecords || [];
    const matchedCourses = requirements.requiredCourses.filter(reqCourse =>
      studentCourses.some(studentCourse => 
        studentCourse.name.toLowerCase().includes(reqCourse.toLowerCase()) ||
        reqCourse.toLowerCase().includes(studentCourse.name.toLowerCase())
      )
    );
    
    if (matchedCourses.length > 0) {
      matchScore += matchedCourses.length * 5;
      matchedQualifications.push(...matchedCourses.map(course => `Completed course: ${course}`));
      evaluationDetails.academicMatch.requiredCourses = { 
        required: requirements.requiredCourses, 
        matched: matchedCourses, 
        met: matchedCourses.length === requirements.requiredCourses.length 
      };
    }
  }

  // Experience Evaluation
  if (requirements.minExperience > 0) {
    const studentExperience = student.workExperience || [];
    const totalExperience = studentExperience.reduce((total, exp) => {
      return total + (exp.duration || 0);
    }, 0);
    
    if (totalExperience >= requirements.minExperience) {
      matchScore += 20;
      matchedQualifications.push(`Experience: ${totalExperience} years`);
      evaluationDetails.experienceMatch.years = { required: requirements.minExperience, actual: totalExperience, met: true };
    } else {
      evaluationDetails.experienceMatch.years = { required: requirements.minExperience, actual: totalExperience, met: false };
      evaluationDetails.missingRequirements.push(`Insufficient experience (${totalExperience} < ${requirements.minExperience} years)`);
    }
  }

  // Skills Evaluation
  if (requirements.requiredSkills && requirements.requiredSkills.length > 0) {
    const studentSkills = student.skills || [];
    const matchedSkills = requirements.requiredSkills.filter(skill =>
      studentSkills.some(studentSkill => 
        studentSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(studentSkill.toLowerCase())
      )
    );
    
    if (matchedSkills.length > 0) {
      matchScore += matchedSkills.length * 3;
      matchedQualifications.push(...matchedSkills.map(skill => `Skill: ${skill}`));
      evaluationDetails.skillMatch = { required: requirements.requiredSkills, matched: matchedSkills };
    }
  }

  // Cap match score at 100
  matchScore = Math.min(matchScore, 100);

  return {
    matchScore,
    matchedQualifications,
    evaluationDetails
  };
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
      
      // Get comprehensive student details
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