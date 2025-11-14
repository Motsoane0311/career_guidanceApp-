// Faculty Schema Definition for Firestore
const FacultySchema = {
  collection: 'faculties',
  fields: {
    institutionId: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string' },
    dean: { type: 'string' },
    contactEmail: { type: 'string' },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp' }
  }
};

module.exports = { FacultySchema };