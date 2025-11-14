const { db } = require('../config/firebase');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { personalInfo, education, academicRecords } = req.body;

    // Create update data with only provided fields
    const updateData = {
      updatedAt: new Date(),
      profileCompleted: true
    };

    if (personalInfo !== undefined) updateData.personalInfo = personalInfo;
    if (education !== undefined) updateData.education = education;
    
    // Calculate GPA and process academic records if provided
    if (academicRecords && Array.isArray(academicRecords)) {
      const { gpa, totalCredits } = calculateGPA(academicRecords);
      updateData.education = {
        ...updateData.education,
        academicRecords: academicRecords,
        gpa: gpa,
        totalCredits: totalCredits
      };
    }

    await db.collection('students').doc(userId).update(updateData);

    // Also update users collection
    await db.collection('users').doc(userId).update({
      profileCompleted: true
    });

    res.json({ 
      message: 'Profile updated successfully',
      gpa: updateData.education?.gpa,
      totalCredits: updateData.education?.totalCredits
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GPA Calculation Helper
const calculateGPA = (academicRecords) => {
  if (!academicRecords || academicRecords.length === 0) {
    return { gpa: 0, totalCredits: 0 };
  }

  let totalPoints = 0;
  let totalCredits = 0;

  academicRecords.forEach(record => {
    const credits = parseInt(record.credits) || 0;
    const gradePoints = convertGradeToPoints(record.grade);
    
    totalPoints += gradePoints * credits;
    totalCredits += credits;
  });

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  
  return {
    gpa: parseFloat(gpa.toFixed(2)),
    totalCredits: totalCredits
  };
};

const convertGradeToPoints = (grade) => {
  const gradeUpper = grade.toString().toUpperCase();
  
  if (gradeUpper.includes('A') || gradeUpper === 'A') return 4.0;
  if (gradeUpper.includes('B') || gradeUpper === 'B') return 3.0;
  if (gradeUpper.includes('C') || gradeUpper === 'C') return 2.0;
  if (gradeUpper.includes('D') || gradeUpper === 'D') return 1.0;
  
  // Handle percentage grades
  const percentage = parseFloat(grade);
  if (!isNaN(percentage)) {
    if (percentage >= 80) return 4.0;
    if (percentage >= 70) return 3.0;
    if (percentage >= 60) return 2.0;
    if (percentage >= 50) return 1.0;
  }
  
  return 0.0;
};

// Academic Evaluation for Course Applications
exports.evaluateStudentForCourse = async (studentId, courseId) => {
  try {
    const studentDoc = await db.collection('students').doc(studentId).get();
    const courseDoc = await db.collection('courses').doc(courseId).get();
    
    if (!studentDoc.exists || !courseDoc.exists) {
      return { eligible: false, reason: 'Student or course not found' };
    }

    const student = studentDoc.data();
    const course = courseDoc.data();
    const requirements = course.requirements || {};

    const evaluation = {
      eligible: true,
      meetsGPA: true,
      meetsSubjectRequirements: true,
      meetsCreditRequirements: true,
      missingSubjects: [],
      reasons: []
    };

    // Check GPA requirement
    const studentGPA = student.education?.gpa || 0;
    const requiredGPA = requirements.minimumGPA || 2.5;
    
    if (studentGPA < requiredGPA) {
      evaluation.eligible = false;
      evaluation.meetsGPA = false;
      evaluation.reasons.push(`GPA ${studentGPA} is below required ${requiredGPA}`);
    }

    // Check subject requirements
    const requiredSubjects = requirements.requiredSubjects || [];
    const studentSubjects = student.education?.academicRecords || [];
    
    requiredSubjects.forEach(reqSubject => {
      const studentSubject = studentSubjects.find(subj => 
        subj.name.toLowerCase().includes(reqSubject.subject.toLowerCase()) ||
        reqSubject.subject.toLowerCase().includes(subj.name.toLowerCase())
      );

      if (!studentSubject) {
        evaluation.eligible = false;
        evaluation.meetsSubjectRequirements = false;
        evaluation.missingSubjects.push(reqSubject.subject);
        evaluation.reasons.push(`Missing required subject: ${reqSubject.subject}`);
      } else {
        // Check if grade meets requirement
        const studentGrade = convertGradeToPoints(studentSubject.grade);
        const requiredGrade = convertGradeToPoints(reqSubject.minimumGrade || 'C');
        
        if (studentGrade < requiredGrade) {
          evaluation.eligible = false;
          evaluation.meetsSubjectRequirements = false;
          evaluation.reasons.push(`Grade in ${reqSubject.subject} (${studentSubject.grade}) is below required (${reqSubject.minimumGrade || 'C'})`);
        }
      }
    });

    // Check credit requirements
    const studentCredits = student.education?.totalCredits || 0;
    const requiredCredits = requirements.minimumCredits || 0;
    
    if (studentCredits < requiredCredits) {
      evaluation.eligible = false;
      evaluation.meetsCreditRequirements = false;
      evaluation.reasons.push(`Total credits ${studentCredits} is below required ${requiredCredits}`);
    }

    evaluation.studentGPA = studentGPA;
    evaluation.studentCredits = studentCredits;

    return evaluation;
  } catch (error) {
    console.error('Evaluation error:', error);
    return { eligible: false, reason: 'Evaluation error' };
  }
};

// ALL THE REST STAYS EXACTLY THE SAME
exports.uploadTranscripts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { transcripts, certificates } = req.body;

    await db.collection('students').doc(userId).update({
      transcripts: transcripts || [],
      certificates: certificates || [],
      transcriptsUploaded: true,
      updatedAt: new Date()
    });

    res.json({ message: 'Transcripts uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const applicationsSnapshot = await db.collection('applications')
      .where('studentId', '==', userId)
      .get();
    
    const applications = [];
    for (const doc of applicationsSnapshot.docs) {
      const application = doc.data();
      
      // Get course details
      const courseDoc = await db.collection('courses').doc(application.courseId).get();
      const course = courseDoc.data();
      
      // Get institution details
      const institutionDoc = await db.collection('institutions').doc(application.institutionId).get();
      const institution = institutionDoc.data();

      // Get faculty details
      const facultyDoc = await db.collection('faculties').doc(course.facultyId).get();
      const faculty = facultyDoc.data();

      applications.push({
        id: doc.id,
        ...application,
        course: {
          id: courseDoc.id,
          ...course,
          faculty: faculty
        },
        institution: {
          id: institutionDoc.id,
          ...institution
        }
      });
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const jobApplicationsSnapshot = await db.collection('jobApplications')
      .where('studentId', '==', userId)
      .get();
    
    const jobApplications = [];
    for (const doc of jobApplicationsSnapshot.docs) {
      const jobApplication = doc.data();
      
      // Get job details
      const jobDoc = await db.collection('jobs').doc(jobApplication.jobId).get();
      const job = jobDoc.data();
      
      // Get company details
      const companyDoc = await db.collection('companies').doc(job.companyId).get();
      const company = companyDoc.data();

      jobApplications.push({
        id: doc.id,
        ...jobApplication,
        job: {
          id: jobDoc.id,
          ...job
        },
        company: {
          id: companyDoc.id,
          ...company
        }
      });
    }

    res.json(jobApplications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};