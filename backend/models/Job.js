// Enhanced Job Schema Definition for Firestore
const JobSchema = {
  collection: 'jobs',
  fields: {
    companyId: { type: 'string', required: true },
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    requirements: {
      type: 'object',
      fields: {
        // Academic requirements
        education: {
          type: 'object',
          fields: {
            level: { type: 'string' }, // 'high_school', 'diploma', 'bachelors', 'masters', 'phd'
            field: { type: 'string' },
            minGPA: { type: 'number' }
          }
        },
        minGPA: { type: 'number' },
        requiredCourses: { type: 'array' },
        universityRequirements: { type: 'object' },
        
        // Experience requirements
        minExperience: { type: 'number' },
        requiredSkills: { type: 'array' },
        certificates: { type: 'array' },
        
        // Reference requirements
        requireReferences: { type: 'boolean', default: false },
        minReferences: { type: 'number', default: 0 }
      }
    },
    qualifications: { type: 'array', default: [] },
    location: { type: 'string' },
    salary: { type: 'string' },
    jobType: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'internship'] },
    deadline: { type: 'timestamp', required: true },
    status: { type: 'string', enum: ['active', 'closed', 'draft'], default: 'active' },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp' }
  }
};

module.exports = { JobSchema };