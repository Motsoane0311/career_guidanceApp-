// Student Schema Definition for Firestore
const StudentSchema = {
  collection: 'students',
  fields: {
    userId: { type: 'string', required: true },
    email: { type: 'string', required: true },
    personalInfo: {
      type: 'object',
      fields: {
        firstName: { type: 'string', required: true },
        lastName: { type: 'string', required: true },
        dateOfBirth: { type: 'timestamp' },
        phone: { type: 'string' },
        address: { type: 'string' },
        nationality: { type: 'string' }
      }
    },
    education: {
      type: 'object',
      fields: {
        highSchool: { type: 'string' },
        graduationYear: { type: 'number' },
        grades: { type: 'object' },
        degreeLevel: { type: 'string' }, // 'high_school', 'diploma', 'bachelors', 'masters', 'phd'
        academicRecords: {
          type: 'array',
          fields: {
            subject: { type: 'string' },
            grade: { type: 'string' },
            credits: { type: 'number' },
            type: { type: 'string' } // 'core', 'elective', 'honors'
          }
        },
        gpa: { type: 'number' },
        totalCredits: { type: 'number' }
      }
    },
    applications: { type: 'array', default: [] },
    transcripts: { type: 'array', default: [] },
    certificates: { type: 'array', default: [] },
    transcriptsUploaded: { type: 'boolean', default: false },
    profileCompleted: { type: 'boolean', default: false },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp' }
  }
};

module.exports = { StudentSchema };