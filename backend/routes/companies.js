const express = require('express');
const { 
  updateProfile, 
  getProfile, 
  getJobApplicants, 
  updateApplicationStatus,
  getDashboardStats 
} = require('../controllers/companyController');
const { authenticate, authorize, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

// All routes require company authentication and email verification
router.use(authenticate, authorize('company'), requireEmailVerification);

router.put('/profile', updateProfile);
router.get('/profile', getProfile);
router.get('/dashboard', getDashboardStats);
router.get('/jobs/:jobId/applicants', getJobApplicants);
router.put('/applications/:applicationId/status', updateApplicationStatus);

module.exports = router;