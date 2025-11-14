const express = require('express');
const { 
  getDashboardStats, 
  manageCompanyStatus, 
  manageInstitutionStatus,
  getAllUsers,
  getAllInstitutions,
  getAllCompanies,
  addInstitution,
  addFaculty,
  addCourse,
  deleteInstitution,
  deleteFaculty,
  deleteCourse,
  getSystemReports
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, authorize('admin'));

// Dashboard and Reports
router.get('/dashboard', getDashboardStats);
router.get('/reports', getSystemReports);

// User Management
router.get('/users', getAllUsers);

// Institution Management
router.get('/institutions', getAllInstitutions);
router.post('/institutions', addInstitution);
router.delete('/institutions/:institutionId', deleteInstitution);
router.put('/institutions/:institutionId/status', manageInstitutionStatus);

// Faculty Management
router.post('/faculties', addFaculty);
router.delete('/faculties/:facultyId', deleteFaculty);

// Course Management
router.post('/courses', addCourse);
router.delete('/courses/:courseId', deleteCourse);

// Company Management
router.get('/companies', getAllCompanies);
router.put('/companies/:companyId/status', manageCompanyStatus);

module.exports = router;