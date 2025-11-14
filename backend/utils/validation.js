const { body } = require('express-validator');

const studentProfileValidation = [
  body('personalInfo.firstName').notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
  body('personalInfo.dateOfBirth').isDate().withMessage('Valid date of birth is required'),
  body('education.highSchool').notEmpty().withMessage('High school name is required'),
  body('education.graduationYear').isInt({ min: 1900, max: new Date().getFullYear() })
];

const institutionProfileValidation = [
  body('name').notEmpty().withMessage('Institution name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('address').notEmpty().withMessage('Address is required')
];

const companyProfileValidation = [
  body('name').notEmpty().withMessage('Company name is required'),
  body('industry').notEmpty().withMessage('Industry is required'),
  body('contact.phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('website').optional().isURL().withMessage('Valid website URL is required')
];

const courseValidation = [
  body('name').notEmpty().withMessage('Course name is required'),
  body('description').notEmpty().withMessage('Course description is required'),
  body('duration').notEmpty().withMessage('Course duration is required'),
  body('fees').isFloat({ min: 0 }).withMessage('Valid fees amount is required'),
  body('seats').isInt({ min: 1 }).withMessage('Number of seats must be at least 1')
];

const jobValidation = [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('deadline').isISO8601().withMessage('Valid deadline date is required'),
  body('location').notEmpty().withMessage('Job location is required'),
  body('salary').notEmpty().withMessage('Salary information is required'),
  body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship']).withMessage('Valid job type is required')
];

module.exports = {
  studentProfileValidation,
  institutionProfileValidation,
  companyProfileValidation,
  courseValidation,
  jobValidation
};