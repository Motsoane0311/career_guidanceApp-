const express = require('express');
const { 
  applyForCourse, 
  getCourseApplications,
  getApplicationById,
  updateApplicationStatus,
  getStudentApplications
} = require('../controllers/applicationController');
const { authenticate, authorize, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

// Public routes (with authentication)
router.get('/course/:courseId', authenticate, getCourseApplications);
router.get('/:applicationId', authenticate, getApplicationById);

// Student routes
router.post('/apply/course',  // CHANGED FROM '/apply' TO '/apply/course'
  authenticate, 
  authorize('student'), 
  requireEmailVerification, 
  applyForCourse
);

router.get('/student/my-applications',
  authenticate,
  authorize('student'),
  requireEmailVerification,
  getStudentApplications
);

// Institution routes
router.put('/:applicationId/status',
  authenticate,
  authorize('institution'),
  requireEmailVerification,
  updateApplicationStatus
);

// Admin routes
router.put('/admin/:applicationId/status',
  authenticate,
  authorize('admin'),
  updateApplicationStatus
);

module.exports = router;