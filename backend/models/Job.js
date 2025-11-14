// Job Schema Definition for Firestore
const JobSchema = {
  collection: 'jobs',
  fields: {
    companyId: { type: 'string', required: true },
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    requirements: {
      type: 'object',
      fields: {
        educationLevel: { type: 'string' },
        minExperience: { type: 'number' },
        skills: { type: 'array' },
        certificates: { type: 'array' }
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