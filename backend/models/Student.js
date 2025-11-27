// Enhanced Student Schema Definition for Firestore
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
        university: { type: 'string' },
        highSchool: { type: 'string' },
        graduationYear: { type: 'number' },
        degreeLevel: { type: 'string' }, // 'high_school', 'diploma', 'bachelors', 'masters', 'phd'
        fieldOfStudy: { type: 'string' },
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
    workExperience: {
      type: 'array',
      fields: {
        company: { type: 'string' },
        position: { type: 'string' },
        duration: { type: 'number' }, // in months
        description: { type: 'string' },
        startDate: { type: 'timestamp' },
        endDate: { type: 'timestamp' },
        currentlyWorking: { type: 'boolean' }
      }
    },
    references: {
      type: 'array',
      fields: {
        name: { type: 'string' },
        position: { type: 'string' },
        company: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        relationship: { type: 'string' }
      }
    },
    skills: { type: 'array', default: [] },
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