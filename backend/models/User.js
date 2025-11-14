// User Schema Definition for Firestore
const UserSchema = {
  collection: 'users',
  fields: {
    email: { type: 'string', required: true },
    role: { type: 'string', required: true, enum: ['admin', 'institution', 'student', 'company'] },
    createdAt: { type: 'timestamp', required: true },
    profileCompleted: { type: 'boolean', default: false },
    emailVerified: { type: 'boolean', default: false },
    verificationToken: { type: 'string' },
    verificationTokenExpires: { type: 'timestamp' },
    resetToken: { type: 'string' },
    resetTokenExpires: { type: 'timestamp' }
  }
};

module.exports = { UserSchema };