const express = require('express');
const { db } = require('../config/firebase');

const router = express.Router();

// Public route to get all active institutions
router.get('/institutions/public', async (req, res) => {
  try {
    const institutionsSnapshot = await db.collection('institutions')
      .where('status', '==', 'active')
      .get();
    
    const institutions = [];
    for (const doc of institutionsSnapshot.docs) {
      const institution = doc.data();
      
      // Get faculties for this institution
      const facultiesSnapshot = await db.collection('faculties')
        .where('institutionId', '==', doc.id)
        .get();
      
      const faculties = [];
      facultiesSnapshot.forEach(facultyDoc => {
        faculties.push({
          id: facultyDoc.id,
          ...facultyDoc.data()
        });
      });

      // Get courses for this institution
      const coursesSnapshot = await db.collection('courses')
        .where('institutionId', '==', doc.id)
        .where('status', '==', 'active')
        .get();
      
      const courses = [];
      coursesSnapshot.forEach(courseDoc => {
        courses.push({
          id: courseDoc.id,
          ...courseDoc.data()
        });
      });

      institutions.push({
        id: doc.id,
        ...institution,
        faculties,
        courses
      });
    }

    res.json(institutions);
  } catch (error) {
    console.error('Error fetching public institutions:', error);
    res.status(500).json({ error: 'Failed to load institutions' });
  }
});

module.exports = router;