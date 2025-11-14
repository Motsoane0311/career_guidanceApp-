const { db } = require('../config/firebase');

exports.addCourse = async (req, res) => {
  try {
    const institutionId = req.user.userId;
    const { facultyId, name, description, duration, fees, seats, requirements } = req.body;

    // Verify faculty belongs to institution
    const facultyDoc = await db.collection('faculties').doc(facultyId).get();
    if (!facultyDoc.exists || facultyDoc.data().institutionId !== institutionId) {
      return res.status(403).json({ error: 'Faculty not found or access denied' });
    }

    const courseRef = await db.collection('courses').add({
      institutionId,
      facultyId,
      name,
      description,
      duration,
      fees: parseFloat(fees),
      seats: parseInt(seats),
      requirements: requirements || '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update institution's courses array
    await db.collection('institutions').doc(institutionId).update({
      courses: db.FieldValue.arrayUnion(courseRef.id)
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

exports.getInstitutionCourses = async (req, res) => {
  try {
    const institutionId = req.user.userId;

    const coursesSnapshot = await db.collection('courses')
      .where('institutionId', '==', institutionId)
      .get();
    
    const courses = [];
    for (const doc of coursesSnapshot.docs) {
      const course = doc.data();
      
      // Get faculty details
      const facultyDoc = await db.collection('faculties').doc(course.facultyId).get();
      const faculty = facultyDoc.data();

      // Get applications count
      const applicationsSnapshot = await db.collection('applications')
        .where('courseId', '==', doc.id)
        .get();

      courses.push({
        id: doc.id,
        ...course,
        faculty: faculty,
        applications: applicationsSnapshot.size
      });
    }

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const institutionId = req.user.userId;
    const { courseId } = req.params;
    const { name, description, duration, fees, seats, requirements } = req.body;

    // Verify course belongs to institution
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists || courseDoc.data().institutionId !== institutionId) {
      return res.status(403).json({ error: 'Course not found or access denied' });
    }

    await db.collection('courses').doc(courseId).update({
      name,
      description,
      duration,
      fees: parseFloat(fees),
      seats: parseInt(seats),
      requirements: requirements || '',
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
    const institutionId = req.user.userId;
    const { courseId } = req.params;

    // Verify course belongs to institution
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists || courseDoc.data().institutionId !== institutionId) {
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

    // Remove course from institution's courses array
    await db.collection('institutions').doc(institutionId).update({
      courses: db.FieldValue.arrayRemove(courseId)
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: error.message });
  }
};