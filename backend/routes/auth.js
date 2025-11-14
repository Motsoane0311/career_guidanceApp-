const express = require('express');
const { body } = require('express-validator');
const { 
  register, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  getProfile,
  devVerifyEmail 
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'institution', 'company'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getProfile);

// Development-only route for manual email verification
//router.post('/dev-verify-email', devVerifyEmail);

module.exports = router;