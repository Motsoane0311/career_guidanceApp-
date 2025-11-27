// Enhanced Application Schema Definition for Firestore
const ApplicationSchema = {
  collection: 'applications',
  fields: {
    studentId: { type: 'string', required: true },
    institutionId: { type: 'string', required: true },
    courseId: { type: 'string', required: true },
    status: { 
      type: 'string', 
      enum: ['pending', 'admitted', 'rejected', 'waiting_list'], 
      default: 'pending' 
    },
    documents: { type: 'array', default: [] },
    studentGPA: { type: 'number' },
    studentCredits: { type: 'number' },
    evaluation: { type: 'object' },
    appliedAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp' },
    admissionDecisionAt: { type: 'timestamp' }
  }
};

// Job Application Schema
const JobApplicationSchema = {
  collection: 'jobApplications',
  fields: {
    studentId: { type: 'string', required: true },
    jobId: { type: 'string', required: true },
    status: { 
      type: 'string', 
      enum: ['pending', 'accepted', 'rejected', 'under_review'], 
      default: 'pending' 
    },
    coverLetter: { type: 'string' },
    workExperience: { type: 'array', default: [] },
    references: { type: 'array', default: [] },
    additionalDocuments: { type: 'array', default: [] },
    matchScore: { type: 'number', default: 0 },
    matchedQualifications: { type: 'array', default: [] },
    evaluationDetails: { type: 'object' },
    appliedAt: { type: 'timestamp', required: true },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp' }
  }
};

module.exports = { ApplicationSchema, JobApplicationSchema };