const { admin, db } = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Simple token generation
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role }, 
    process.env.JWT_SECRET || 'fallback-secret-key-123', 
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // HARDCODED ADMIN LOGIN - This will always work
    if (email === 'Pago7@gmail.com' && password === 'p123456') {
      console.log('✅ Admin login detected');
      
      // Check if admin exists in Firestore
      let adminUser = await db.collection('users')
        .where('email', '==', 'Pago7@gmail.com')
        .where('role', '==', 'admin')
        .get();

      let adminId;
      
      if (adminUser.empty) {
        console.log('🆕 Creating admin user...');
        // Create admin user in Firestore with a simple ID
        adminId = 'admin-' + Date.now();
        
        await db.collection('users').doc(adminId).set({
          email: 'Pago7@gmail.com',
          role: 'admin',
          createdAt: new Date(),
          profileCompleted: true,
          emailVerified: true,
        });

        await db.collection('admins').doc(adminId).set({
          userId: adminId,
          name: 'Phakiso Motsoane',
          createdAt: new Date(),
        });
        
        console.log('✅ Admin user created in Firestore');
      } else {
        adminId = adminUser.docs[0].id;
        console.log('✅ Admin user found in Firestore');
      }

      // Generate token
      const token = generateToken(adminId, 'Pago7@gmail.com', 'admin');

      // Get admin profile
      const adminProfile = await db.collection('admins').doc(adminId).get();
      const profileData = adminProfile.exists ? adminProfile.data() : { name: 'Phakiso Motsoane' };

      console.log('✅ Admin login successful');
      
      return res.json({
        message: 'Admin login successful',
        token,
        user: {
          userId: adminId,
          email: 'Pago7@gmail.com',
          role: 'admin',
          profileCompleted: true,
          emailVerified: true,
          profile: profileData
        }
      });
    }

    // REGULAR USER LOGIN - Simplified version
    console.log('👤 Regular user login attempt');
    
    try {
      // Try to find user in Firestore first
      const users = await db.collection('users')
        .where('email', '==', email)
        .get();

      if (users.empty) {
        console.log('❌ User not found in Firestore');
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const userDoc = users.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      console.log('✅ User found:', userData.role);

      // Generate token for regular user
      const token = generateToken(userId, userData.email, userData.role);

      // Get profile data based on role
      let profileData = {};
      if (userData.role === 'student') {
        const studentDoc = await db.collection('students').doc(userId).get();
        profileData = studentDoc.exists ? studentDoc.data() : {};
      } else if (userData.role === 'institution') {
        const institutionDoc = await db.collection('institutions').doc(userId).get();
        profileData = institutionDoc.exists ? institutionDoc.data() : {};
      } else if (userData.role === 'company') {
        const companyDoc = await db.collection('companies').doc(userId).get();
        profileData = companyDoc.exists ? companyDoc.data() : {};
      }

      console.log('✅ Regular user login successful');
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          userId: userId,
          email: userData.email,
          role: userData.role,
          profileCompleted: userData.profileCompleted || false,
          emailVerified: userData.emailVerified || false,
          profile: profileData
        }
      });

    } catch (error) {
      console.error('Regular user login error:', error);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Login failed. Please try again.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, userData } = req.body;
    console.log('📝 Registration attempt:', email, role);

    // Validate role
    const allowedRoles = ['student', 'institution', 'company'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users')
      .where('email', '==', email)
      .get();

    if (!existingUser.empty) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create simple user ID
    const userId = role + '-' + Date.now();

    // Create user in Firestore
    await db.collection('users').doc(userId).set({
      email,
      role,
      createdAt: new Date(),
      profileCompleted: false,
      emailVerified: true, // Auto-verify in development
    });

    // Create role-specific profile
    const baseData = {
      userId: userId,
      email: email,
      createdAt: new Date(),
      ...userData
    };

    if (role === 'student') {
      await db.collection('students').doc(userId).set({
        ...baseData,
        personalInfo: {},
        education: {},
        applications: [],
        profileCompleted: false,
      });
    } else if (role === 'institution') {
      await db.collection('institutions').doc(userId).set({
        ...baseData,
        name: userData?.name || '',
        status: 'active',
        faculties: [],
        profileCompleted: false,
      });
    } else if (role === 'company') {
      await db.collection('companies').doc(userId).set({
        ...baseData,
        name: userData?.name || '',
        status: 'pending',
        jobs: [],
        profileCompleted: false,
      });
    }

    // Generate token
    const token = generateToken(userId, email, role);

    console.log('✅ User registered successfully:', email);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        userId: userId,
        email: email,
        role: role,
        profileCompleted: false,
        emailVerified: true
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('📋 Get profile for:', userId);
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    let profileData = {};

    // Get role-specific data
    if (userData.role === 'student') {
      const studentDoc = await db.collection('students').doc(userId).get();
      profileData = studentDoc.exists ? studentDoc.data() : {};
    } else if (userData.role === 'institution') {
      const institutionDoc = await db.collection('institutions').doc(userId).get();
      profileData = institutionDoc.exists ? institutionDoc.data() : {};
    } else if (userData.role === 'company') {
      const companyDoc = await db.collection('companies').doc(userId).get();
      profileData = companyDoc.exists ? companyDoc.data() : {};
    } else if (userData.role === 'admin') {
      const adminDoc = await db.collection('admins').doc(userId).get();
      profileData = adminDoc.exists ? adminDoc.data() : {};
    }

    console.log('✅ Profile retrieved successfully');
    
    res.json({
      ...userData,
      profile: profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Simple versions of other auth functions
exports.verifyEmail = async (req, res) => {
  res.json({ message: 'Email verification not required', verified: true });
};

exports.forgotPassword = async (req, res) => {
  res.json({ message: 'Password reset not implemented in demo' });
};

exports.resetPassword = async (req, res) => {
  res.json({ message: 'Password reset not implemented in demo' });
};