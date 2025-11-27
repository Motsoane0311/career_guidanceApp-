const { admin, db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminEmail = 'mohAdmin@gmail.com';  // UPDATED
    const adminPassword = '123456';           // UPDATED

    // Check if admin already exists
    const adminUsers = await db.collection('users')
      .where('email', '==', adminEmail)
      .where('role', '==', 'admin')
      .get();

    if (!adminUsers.empty) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: adminEmail,
      password: adminPassword,
      emailVerified: true,
      displayName: 'System Administrator'
    });

    // Create admin user in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: adminEmail,
      role: 'admin',
      createdAt: new Date(),
      profileCompleted: true,
      emailVerified: true,
    });

    // Create admin profile
    await db.collection('admins').doc(userRecord.uid).set({
      userId: userRecord.uid,
      name: 'System Administrator',
      createdAt: new Date(),
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 User ID:', userRecord.uid);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  seedAdmin().then(() => process.exit(0));
}

module.exports = seedAdmin;