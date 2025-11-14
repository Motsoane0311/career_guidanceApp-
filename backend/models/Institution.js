// Institution Schema Definition for Firestore
const InstitutionSchema = {
  collection: 'institutions',
  fields: {
    userId: { type: 'string', required: true },
    email: { type: 'string', required: true },
    name: { type: 'string', required: true },
    phone: { type: 'string' },
    address: { type: 'string' },
    description: { type: 'string' },
    logo: { type: 'string' },
    status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
    faculties: { type: 'array', default: [] },
    createdAt: { type: 'timestamp', required: true },
    updatedAt: { type: 'timestamp' }
  }
};

module.exports = { InstitutionSchema };