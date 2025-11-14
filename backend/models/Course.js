// Course Schema Definition for Firestore
const CourseSchema = {
  collection: 'courses',
  fields: {
    institutionId: { type: 'string', required: true },
    facultyId: { type: 'string', required: true },
    name: { type: 'string', required: true },
    code: { type: 'string' },
    description: { type: 'string', required: true },
    duration: { type: 'string', required: true }, // e.g., "4 years", "2 semesters"
    fees: { type: 'number', required: true },
    seats: { type: 'number', required: true },
    requirements: {
      type: 'object',
      fields: {
        minimumGPA: { type: 'number', default: 2.5 },
        requiredSubjects: {
          type: 'array',
          fields: {
            subject: { type: 'string' },
            minimumGrade: { type: 'string' }, // 'A', 'B', 'C', etc.
            minimumScore: { type: 'number' } // percentage
          }
        },
        minimumCredits: { type: 'number', default: 0 },
        entranceExam: { type: 'boolean', default: false },
        additionalRequirements: { type: 'string' }
      }
    },
    curriculum: { type: 'array' },
    careerOpportunities: { type: 'array' },
    status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp' }
  }
};

module.exports = { CourseSchema };