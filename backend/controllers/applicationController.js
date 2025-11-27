const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

exports.applyForCourse = async (req, res) => {
  try {
    const { institutionId, courseId, documents, courseName } = req.body;
    const studentId = req.user.userId;

    console.log('Apply for course request:', { institutionId, courseId, studentId });

    // Validate required fields
    if (!institutionId || !courseId) {
      return res.status(400).json({ 
        error: 'Institution ID and Course ID are required',
        received: { institutionId, courseId }
      });
    }

    // Check if student exists and has complete profile
    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(400).json({ 
        error: 'Student profile not found. Please complete your profile first.' 
      });
    }

    const studentData = studentDoc.data();
    
    // Check if student has academic records
    if (!studentData.education?.academicRecords || studentData.education.academicRecords.length === 0) {
      return res.status(400).json({ 
        error: 'Please add your academic records and calculate GPA before applying for courses' 
      });
    }

    // Check if course exists and get details
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseDoc.data();
    console.log('Course data:', course);

    // Verify course belongs to the specified institution
    if (course.institutionId !== institutionId) {
      return res.status(400).json({ 
        error: 'Course does not belong to the specified institution',
        courseInstitution: course.institutionId,
        requestedInstitution: institutionId
      });
    }

    // Check if course has available seats
    if (course.seats <= 0) {
      return res.status(400).json({ 
        error: 'No seats available for this course' 
      });
    }

    // Check if student has already applied to 2 courses in this institution
    const existingApplications = await db.collection('applications')
      .where('studentId', '==', studentId)
      .where('institutionId', '==', institutionId)
      .get();

    if (existingApplications.size >= 2) {
      return res.status(400).json({ 
        error: 'You can only apply for maximum 2 courses per institution' 
      });
    }

    // Check if already applied to this course
    const existingApplication = await db.collection('applications')
      .where('studentId', '==', studentId)
      .where('courseId', '==', courseId)
      .get();

    if (!existingApplication.empty) {
      return res.status(400).json({ 
        error: 'You have already applied for this course' 
      });
    }

    // Get institution details
    const institutionDoc = await db.collection('institutions').doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    const institution = institutionDoc.data();

    // Get student personal info
    const studentPersonalInfo = studentData.personalInfo || {};
    const studentName = `${studentPersonalInfo.firstName || ''} ${studentPersonalInfo.lastName || ''}`.trim() || req.user.email.split('@')[0] || 'Student';

    // Evaluate student for course
    const evaluation = await evaluateStudentForCourse(studentId, courseId);

    // Create application
    const applicationRef = await db.collection('applications').add({
      studentId,
      institutionId,
      courseId,
      courseName: courseName || course.name,
      studentName: studentName,
      studentEmail: req.user.email,
      institutionName: institution.name,
      studentGPA: studentData.education?.gpa || 0,
      studentCredits: studentData.education?.totalCredits || 0,
      evaluation: evaluation,
      documents: documents || [],
      status: 'pending',
      appliedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update student's applications array
    await db.collection('students').doc(studentId).update({
      applications: FieldValue.arrayUnion(applicationRef.id),
      updatedAt: new Date()
    });

    // Update institution's applications array
    await db.collection('institutions').doc(institutionId).update({
      applications: FieldValue.arrayUnion(applicationRef.id),
      updatedAt: new Date()
    });

    // Decrease available seats by 1
    await db.collection('courses').doc(courseId).update({
      seats: FieldValue.increment(-1),
      updatedAt: new Date()
    });

    console.log('Application created successfully:', applicationRef.id);

    res.status(201).json({ 
      message: 'Application submitted successfully', 
      applicationId: applicationRef.id,
      evaluation: evaluation
    });

  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Enhanced evaluation function
const evaluateStudentForCourse = async (studentId, courseId) => {
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
      reasons: [],
      studentGPA: student.education?.gpa || 0,
      studentCredits: student.education?.totalCredits || 0
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

    return evaluation;
  } catch (error) {
    console.error('Evaluation error:', error);
    return { eligible: false, reason: 'Evaluation error' };
  }
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

// ... rest of your existing functions (getCourseApplications, getApplicationById, updateApplicationStatus, handleAdmissionSeating, getStudentApplications) remain exactly the same
exports.getCourseApplications = async (req, res) => {
  try {
    const { courseId } = req.params;

    const applicationsSnapshot = await db.collection('applications')
      .where('courseId', '==', courseId)
      .get();
    
    const applications = [];
    for (const doc of applicationsSnapshot.docs) {
      const application = doc.data();
      
      // Get student details
      const studentDoc = await db.collection('students').doc(application.studentId).get();
      const student = studentDoc.data();

      // Get user details for email
      const userDoc = await db.collection('users').doc(application.studentId).get();
      const user = userDoc.data();

      applications.push({
        id: doc.id,
        ...application,
        student: {
          id: studentDoc.id,
          email: user.email,
          ...student
        }
      });
    }

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const applicationDoc = await db.collection('applications').doc(applicationId).get();
    if (!applicationDoc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = applicationDoc.data();
    
    // Get student details
    const studentDoc = await db.collection('students').doc(application.studentId).get();
    const student = studentDoc.data();

    // Get course details
    const courseDoc = await db.collection('courses').doc(application.courseId).get();
    const course = courseDoc.data();

    // Get institution details
    const institutionDoc = await db.collection('institutions').doc(application.institutionId).get();
    const institution = institutionDoc.data();

    // Get faculty details
    const facultyDoc = await db.collection('faculties').doc(course.facultyId).get();
    const faculty = facultyDoc.data();

    res.json({
      id: applicationDoc.id,
      ...application,
      student: {
        id: studentDoc.id,
        ...student
      },
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
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'admitted', 'rejected', 'waiting_list'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const applicationDoc = await db.collection('applications').doc(applicationId).get();
    if (!applicationDoc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = applicationDoc.data();
    
    // Verify the user has permission to update this application
    // For institutions: check if they own the course
    if (req.user.role === 'institution') {
      const courseDoc = await db.collection('courses').doc(application.courseId).get();
      if (!courseDoc.exists || courseDoc.data().institutionId !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    await db.collection('applications').doc(applicationId).update({
      status,
      updatedAt: new Date(),
      ...(status === 'admitted' && { admissionDecisionAt: new Date() })
    });

    // If student is admitted to multiple institutions, handle seat allocation
    if (status === 'admitted' && req.user.role === 'institution') {
      await handleAdmissionSeating(applicationId, application);
    }

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to handle admission seating logic
const handleAdmissionSeating = async (applicationId, application) => {
  try {
    // Check if student has other admitted applications
    const otherAdmittedApps = await db.collection('applications')
      .where('studentId', '==', application.studentId)
      .where('status', '==', 'admitted')
      .where('id', '!=', applicationId)
      .get();

    if (!otherAdmittedApps.empty) {
      console.log(`Student ${application.studentId} has multiple admissions`);
    }

    // Check course seat availability
    const courseDoc = await db.collection('courses').doc(application.courseId).get();
    const course = courseDoc.data();
    
    const admittedStudents = await db.collection('applications')
      .where('courseId', '==', application.courseId)
      .where('status', '==', 'admitted')
      .get();

    if (admittedStudents.size > course.seats) {
      // Course is over capacity - move latest admission to waiting list
      await db.collection('applications').doc(applicationId).update({
        status: 'waiting_list',
        updatedAt: new Date()
      });
      
      console.log(`Course ${application.courseId} is over capacity. Moved application to waiting list.`);
    }
  } catch (error) {
    console.error('Error handling admission seating:', error);
  }
};

exports.getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const applicationsSnapshot = await db.collection('applications')
      .where('studentId', '==', studentId)
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
    console.error('Get student applications error:', error);
    res.status(500).json({ error: error.message });
  }
};