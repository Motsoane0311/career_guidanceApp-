const express = require('express');
const { 
  updateProfile, 
  uploadTranscripts, 
  getApplications,
  getJobApplications 
} = require('../controllers/studentController');
const { authenticate, authorize, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

// All routes require student authentication and email verification
router.use(authenticate, authorize('student'), requireEmailVerification);

router.put('/profile', updateProfile);
router.post('/transcripts', uploadTranscripts);
router.get('/applications', getApplications);
router.get('/job-applications', getJobApplications);

module.exports = router;