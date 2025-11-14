const express = require('express');
const { 
  updateProfile, 
  addFaculty, 
  addCourse, 
  getApplications, 
  updateApplicationStatus,
  getFaculties,
  getCourses
} = require('../controllers/institutionController');
const { authenticate, authorize, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

// All routes require institution authentication and email verification
router.use(authenticate, authorize('institution'), requireEmailVerification);

router.put('/profile', updateProfile);
router.post('/faculties', addFaculty);
router.post('/courses', addCourse);
router.get('/applications', getApplications);
router.put('/applications/:applicationId/status', updateApplicationStatus);
router.get('/faculties', getFaculties);
router.get('/courses', getCourses);

module.exports = router;