const { db } = require('../config/firebase');
// Add FieldValue import
const { FieldValue } = require('firebase-admin/firestore');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, description, logo } = req.body;

    const updateData = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;

    await db.collection('institutions').doc(userId).update(updateData);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addFaculty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description } = req.body;

    const facultyRef = await db.collection('faculties').add({
      institutionId: userId,
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // FIX: Use FieldValue instead of db.FieldValue
    await db.collection('institutions').doc(userId).update({
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
    const userId = req.user.userId;
    const { facultyId, name, description, requirements, duration, fees, seats } = req.body;

    // Verify faculty belongs to institution
    const facultyDoc = await db.collection('faculties').doc(facultyId).get();
    if (!facultyDoc.exists || facultyDoc.data().institutionId !== userId) {
      return res.status(403).json({ error: 'Faculty not found or access denied' });
    }

    const courseRef = await db.collection('courses').add({
      institutionId: userId,
      facultyId,
      name,
      description,
      requirements: requirements || [],
      duration,
      fees: parseFloat(fees),
      seats: parseInt(seats),
      status: 'active', // Added missing status field
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // FIX: Use FieldValue instead of db.FieldValue
    await db.collection('institutions').doc(userId).update({
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
    console.error('Add course error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFaculties = async (req, res) => {
  try {
    const userId = req.user.userId;

    const facultiesSnapshot = await db.collection('faculties')
      .where('institutionId', '==', userId)
      .get();
    
    const faculties = [];
    facultiesSnapshot.forEach(doc => {
      faculties.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const coursesSnapshot = await db.collection('courses')
      .where('institutionId', '==', userId)
      .get();
    
    const courses = [];
    for (const doc of coursesSnapshot.docs) {
      const course = doc.data();
      
      // Get faculty details for each course
      const facultyDoc = await db.collection('faculties').doc(course.facultyId).get();
      const faculty = facultyDoc.data();

      courses.push({
        id: doc.id,
        ...course,
        faculty: faculty
      });
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const applicationsSnapshot = await db.collection('applications')
      .where('institutionId', '==', userId)
      .get();
    
    const applications = [];
    for (const doc of applicationsSnapshot.docs) {
      const application = doc.data();
      
      // Get student details
      const studentDoc = await db.collection('students').doc(application.studentId).get();
      const student = studentDoc.data();
      
      // Get course details
      const courseDoc = await db.collection('courses').doc(application.courseId).get();
      const course = courseDoc.data();

      // Get faculty details
      const facultyDoc = await db.collection('faculties').doc(course.facultyId).get();
      const faculty = facultyDoc.data();

      applications.push({
        id: doc.id,
        ...application,
        student: {
          id: studentDoc.id,
          ...student
        },
        course: {
          id: courseDoc.id,
          ...course,
          faculty: faculty
        }
      });
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const applicationDoc = await db.collection('applications').doc(applicationId).get();
    if (!applicationDoc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = applicationDoc.data();
    
    // Verify institution owns this application
    if (application.institutionId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.collection('applications').doc(applicationId).update({
      status,
      updatedAt: new Date()
    });

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add these missing functions for course management
exports.updateCourse = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;
    const { name, description, duration, fees, seats, requirements } = req.body;

    // Verify course belongs to institution
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists || courseDoc.data().institutionId !== userId) {
      return res.status(403).json({ error: 'Course not found or access denied' });
    }

    await db.collection('courses').doc(courseId).update({
      name,
      description,
      duration,
      fees: parseFloat(fees),
      seats: parseInt(seats),
      requirements: requirements || [],
      updatedAt: new Date()
    });

    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;

    // Verify course belongs to institution
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists || courseDoc.data().institutionId !== userId) {
      return res.status(403).json({ error: 'Course not found or access denied' });
    }

    // Check if there are any applications for this course
    const applicationsSnapshot = await db.collection('applications')
      .where('courseId', '==', courseId)
      .get();

    if (!applicationsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete course with existing applications' 
      });
    }

    await db.collection('courses').doc(courseId).delete();

    // FIX: Use FieldValue instead of db.FieldValue
    await db.collection('institutions').doc(userId).update({
      courses: FieldValue.arrayRemove(courseId)
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: error.message });
  }
};