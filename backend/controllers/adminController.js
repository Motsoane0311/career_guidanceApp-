const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const [
      studentsCount,
      institutionsCount,
      companiesCount,
      applicationsCount,
      jobsCount,
      facultiesCount,
      coursesCount
    ] = await Promise.all([
      db.collection('students').get().then(snap => snap.size),
      db.collection('institutions').get().then(snap => snap.size),
      db.collection('companies').get().then(snap => snap.size),
      db.collection('applications').get().then(snap => snap.size),
      db.collection('jobs').get().then(snap => snap.size),
      db.collection('faculties').get().then(snap => snap.size),
      db.collection('courses').get().then(snap => snap.size)
    ]);

    // Get pending companies for approval
    const pendingCompaniesSnapshot = await db.collection('companies')
      .where('status', '==', 'pending')
      .get();

    const pendingCompanies = [];
    pendingCompaniesSnapshot.forEach(doc => {
      pendingCompanies.push({ id: doc.id, ...doc.data() });
    });

    // Get recent activities
    const recentUsers = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const recentActivities = [];
    for (const doc of recentUsers.docs) {
      const user = doc.data();
      recentActivities.push({
        id: doc.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        action: 'Registered'
      });
    }

    // Get application statistics
    const applicationsSnapshot = await db.collection('applications').get();
    const applicationStats = {
      pending: 0,
      admitted: 0,
      rejected: 0,
      waiting_list: 0
    };

    applicationsSnapshot.forEach(doc => {
      const application = doc.data();
      if (applicationStats[application.status] !== undefined) {
        applicationStats[application.status]++;
      }
    });

    res.json({
      stats: {
        students: studentsCount,
        institutions: institutionsCount,
        companies: companiesCount,
        applications: applicationsCount,
        jobs: jobsCount,
        faculties: facultiesCount,
        courses: coursesCount,
        pendingCompanies: pendingCompanies.length
      },
      applicationStats,
      pendingCompanies,
      recentActivities: recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manageCompanyStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'approved', 'suspended', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const companyDoc = await db.collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await db.collection('companies').doc(companyId).update({
      status,
      updatedAt: new Date(),
      reviewedBy: req.user.userId,
      reviewedAt: new Date()
    });

    // Also update user status if company is suspended
    if (status === 'suspended') {
      await db.collection('users').doc(companyId).update({
        status: 'suspended'
      });
    }

    res.json({ message: `Company status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manageInstitutionStatus = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['active', 'inactive', 'suspended'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const institutionDoc = await db.collection('institutions').doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    await db.collection('institutions').doc(institutionId).update({
      status,
      updatedAt: new Date(),
      reviewedBy: req.user.userId,
      reviewedAt: new Date()
    });

    // Also update user status if institution is suspended
    if (status === 'suspended') {
      await db.collection('users').doc(institutionId).update({
        status: 'suspended'
      });
    }

    res.json({ message: `Institution status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    
    const users = [];
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      let profileData = {};

      // Get role-specific data
      if (userData.role === 'student') {
        const studentDoc = await db.collection('students').doc(doc.id).get();
        profileData = studentDoc.exists ? studentDoc.data() : {};
      } else if (userData.role === 'institution') {
        const institutionDoc = await db.collection('institutions').doc(doc.id).get();
        profileData = institutionDoc.exists ? institutionDoc.data() : {};
      } else if (userData.role === 'company') {
        const companyDoc = await db.collection('companies').doc(doc.id).get();
        profileData = companyDoc.exists ? companyDoc.data() : {};
      } else if (userData.role === 'admin') {
        const adminDoc = await db.collection('admins').doc(doc.id).get();
        profileData = adminDoc.exists ? adminDoc.data() : {};
      }

      users.push({
        id: doc.id,
        ...userData,
        profile: profileData
      });
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInstitutions = async (req, res) => {
  try {
    const institutionsSnapshot = await db.collection('institutions').get();
    
    const institutions = [];
    for (const doc of institutionsSnapshot.docs) {
      const institution = doc.data();
      
      // Get faculties count
      const facultiesSnapshot = await db.collection('faculties')
        .where('institutionId', '==', doc.id)
        .get();
      
      // Get courses count
      const coursesSnapshot = await db.collection('courses')
        .where('institutionId', '==', doc.id)
        .get();

      // Get applications count
      const applicationsSnapshot = await db.collection('applications')
        .where('institutionId', '==', doc.id)
        .get();

      institutions.push({
        id: doc.id,
        ...institution,
        stats: {
          faculties: facultiesSnapshot.size,
          courses: coursesSnapshot.size,
          applications: applicationsSnapshot.size
        }
      });
    }

    res.json(institutions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companiesSnapshot = await db.collection('companies').get();
    
    const companies = [];
    for (const doc of companiesSnapshot.docs) {
      const company = doc.data();
      
      // Get jobs count
      const jobsSnapshot = await db.collection('jobs')
        .where('companyId', '==', doc.id)
        .get();

      companies.push({
        id: doc.id,
        ...company,
        stats: {
          jobs: jobsSnapshot.size
        }
      });
    }

    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addInstitution = async (req, res) => {
  try {
    const { name, email, phone, address, description } = req.body;

    // Check if institution already exists
    const existingInstitution = await db.collection('institutions')
      .where('email', '==', email)
      .get();

    if (!existingInstitution.empty) {
      return res.status(400).json({ error: 'Institution with this email already exists' });
    }

    // Create institution
    const institutionRef = await db.collection('institutions').add({
      name,
      email,
      phone,
      address,
      description,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      message: 'Institution added successfully',
      institutionId: institutionRef.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addFaculty = async (req, res) => {
  try {
    const { institutionId, name, description } = req.body;

    // Verify institution exists
    const institutionDoc = await db.collection('institutions').doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    const facultyRef = await db.collection('faculties').add({
      institutionId,
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add faculty to institution's faculties array
    await db.collection('institutions').doc(institutionId).update({
      faculties: FieldValue.arrayUnion({
        id: facultyRef.id,
        name,
        description
      })
    });

    res.status(201).json({
      message: 'Faculty added successfully',
      facultyId: facultyRef.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { institutionId, facultyId, name, description, duration, fees, seats, requirements } = req.body;

    // Verify institution and faculty exist
    const [institutionDoc, facultyDoc] = await Promise.all([
      db.collection('institutions').doc(institutionId).get(),
      db.collection('faculties').doc(facultyId).get()
    ]);

    if (!institutionDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    if (!facultyDoc.exists) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const courseRef = await db.collection('courses').add({
      institutionId,
      facultyId,
      name,
      description,
      duration,
      fees: parseFloat(fees),
      seats: parseInt(seats),
      requirements: requirements || {},
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add course to institution's courses array
    await db.collection('institutions').doc(institutionId).update({
      courses: FieldValue.arrayUnion({
        id: courseRef.id,
        facultyId,
        name,
        description,
        duration,
        fees: parseFloat(fees),
        seats: parseInt(seats)
      })
    });

    res.status(201).json({
      message: 'Course added successfully',
      courseId: courseRef.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const institutionDoc = await db.collection('institutions').doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    // Check if institution has applications
    const applicationsSnapshot = await db.collection('applications')
      .where('institutionId', '==', institutionId)
      .get();

    if (!applicationsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete institution with existing applications' 
      });
    }

    // Delete institution's faculties and courses
    const facultiesSnapshot = await db.collection('faculties')
      .where('institutionId', '==', institutionId)
      .get();

    const coursesSnapshot = await db.collection('courses')
      .where('institutionId', '==', institutionId)
      .get();

    // Delete all faculties
    const facultyDeletions = facultiesSnapshot.docs.map(doc => doc.ref.delete());
    // Delete all courses
    const courseDeletions = coursesSnapshot.docs.map(doc => doc.ref.delete());

    await Promise.all([...facultyDeletions, ...courseDeletions]);

    // Delete institution
    await db.collection('institutions').doc(institutionId).delete();

    // Also delete user account
    await db.collection('users').doc(institutionId).delete();

    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const facultyDoc = await db.collection('faculties').doc(facultyId).get();
    if (!facultyDoc.exists) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const faculty = facultyDoc.data();

    // Check if faculty has courses
    const coursesSnapshot = await db.collection('courses')
      .where('facultyId', '==', facultyId)
      .get();

    if (!coursesSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete faculty with existing courses' 
      });
    }

    // Delete faculty
    await db.collection('faculties').doc(facultyId).delete();

    // Remove faculty from institution's faculties array
    await db.collection('institutions').doc(faculty.institutionId).update({
      faculties: FieldValue.arrayRemove(facultyId)
    });

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseDoc.data();

    // Check if course has applications
    const applicationsSnapshot = await db.collection('applications')
      .where('courseId', '==', courseId)
      .get();

    if (!applicationsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete course with existing applications' 
      });
    }

    // Delete course
    await db.collection('courses').doc(courseId).delete();

    // Remove course from institution's courses array
    await db.collection('institutions').doc(course.institutionId).update({
      courses: FieldValue.arrayRemove(courseId)
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSystemReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    let reportData = {};

    switch (reportType) {
      case 'user_registrations':
        // User registration report
        let userQuery = db.collection('users');
        
        if (startDate && endDate) {
          userQuery = userQuery
            .where('createdAt', '>=', new Date(startDate))
            .where('createdAt', '<=', new Date(endDate));
        }

        const usersSnapshot = await userQuery.get();
        const userRegistrations = {
          total: usersSnapshot.size,
          byRole: {
            student: 0,
            institution: 0,
            company: 0,
            admin: 0
          },
          byDate: {}
        };

        usersSnapshot.forEach(doc => {
          const user = doc.data();
          userRegistrations.byRole[user.role]++;
          
          const dateKey = user.createdAt.toDate().toISOString().split('T')[0];
          userRegistrations.byDate[dateKey] = (userRegistrations.byDate[dateKey] || 0) + 1;
        });

        reportData = userRegistrations;
        break;

      case 'application_analytics':
        // Application analytics report
        const applicationsSnapshot = await db.collection('applications').get();
        const applicationAnalytics = {
          total: applicationsSnapshot.size,
          byStatus: {
            pending: 0,
            admitted: 0,
            rejected: 0,
            waiting_list: 0
          },
          byInstitution: {},
          byCourse: {}
        };

        for (const doc of applicationsSnapshot.docs) {
          const application = doc.data();
          applicationAnalytics.byStatus[application.status]++;
          
          // Get institution name
          const institutionDoc = await db.collection('institutions').doc(application.institutionId).get();
          if (institutionDoc.exists) {
            const institutionName = institutionDoc.data().name;
            applicationAnalytics.byInstitution[institutionName] = 
              (applicationAnalytics.byInstitution[institutionName] || 0) + 1;
          }

          // Get course name
          const courseDoc = await db.collection('courses').doc(application.courseId).get();
          if (courseDoc.exists) {
            const courseName = courseDoc.data().name;
            applicationAnalytics.byCourse[courseName] = 
              (applicationAnalytics.byCourse[courseName] || 0) + 1;
          }
        }

        reportData = applicationAnalytics;
        break;

      case 'company_activity':
        // Company activity report
        const companiesSnapshot = await db.collection('companies').get();
        const companyActivity = {
          total: companiesSnapshot.size,
          byStatus: {
            pending: 0,
            approved: 0,
            suspended: 0,
            rejected: 0
          },
          jobsPosted: 0
        };

        for (const doc of companiesSnapshot.docs) {
          const company = doc.data();
          companyActivity.byStatus[company.status]++;

          // Count jobs posted
          const jobsSnapshot = await db.collection('jobs')
            .where('companyId', '==', doc.id)
            .get();
          companyActivity.jobsPosted += jobsSnapshot.size;
        }

        reportData = companyActivity;
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    res.json({
      reportType,
      generatedAt: new Date(),
      data: reportData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};