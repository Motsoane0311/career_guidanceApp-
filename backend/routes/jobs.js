const express = require('express');
const { 
  createJob, 
  getJobs, 
  applyForJob, 
  getCompanyJobs, 
  getJobApplicants 
} = require('../controllers/jobController');
const { authenticate, authorize, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

// Public routes - anyone can view jobs
router.get('/', getJobs);

// Company routes
router.post('/', 
  authenticate, 
  authorize('company'), 
  requireEmailVerification, 
  createJob
);
router.get('/company', 
  authenticate, 
  authorize('company'), 
  requireEmailVerification, 
  getCompanyJobs
);
router.get('/:jobId/applicants', 
  authenticate, 
  authorize('company'), 
  requireEmailVerification, 
  getJobApplicants
);

// Student routes
router.post('/:jobId/apply', 
  authenticate, 
  authorize('student'), 
  requireEmailVerification, 
  applyForJob
);

module.exports = router;