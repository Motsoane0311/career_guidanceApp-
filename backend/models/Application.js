// Application Schema Definition for Firestore
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
    appliedAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp' },
    admissionDecisionAt: { type: 'timestamp' }
  }
};

module.exports = { ApplicationSchema };