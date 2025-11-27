const { admin, db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

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
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);

    // SIMPLE HARDCODED ADMIN LOGIN - This will always work
    if (email === 'mohAdmin@gmail.com' && password === '123456') {
      console.log('✅ Admin login detected');
      
      // Check if admin exists in Firestore
      let adminUser = await db.collection('users')
        .where('email', '==', 'mohAdmin@gmail.com')
        .where('role', '==', 'admin')
        .get();

      let adminId;
      
      if (adminUser.empty) {
        console.log('🆕 Creating admin user in Firestore...');
        // Create admin user in Firestore
        adminId = 'admin-' + Date.now();
        
        await db.collection('users').doc(adminId).set({
          email: 'mohAdmin@gmail.com',
          role: 'admin',
          createdAt: new Date(),
          profileCompleted: true,
          emailVerified: true,
        });

        await db.collection('admins').doc(adminId).set({
          userId: adminId,
          name: 'System Administrator',
          createdAt: new Date(),
        });
        
        console.log('✅ Admin user created in Firestore');
      } else {
        adminId = adminUser.docs[0].id;
        console.log('✅ Admin user found in Firestore');
      }

      // Generate token
      const token = generateToken(adminId, 'mohAdmin@gmail.com', 'admin');

      console.log('✅ Admin login successful');
      
      return res.json({
        message: 'Admin login successful',
        token,
        user: {
          userId: adminId,
          email: 'mohAdmin@gmail.com',
          role: 'admin',
          profileCompleted: true,
          emailVerified: true,
          name: 'System Administrator'
        }
      });
    }

    // REGULAR USER LOGIN
    console.log('👤 Regular user login attempt');
    
    // Try to find user in Firestore
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

    // For regular users, just check if they exist (password checking would normally be here)
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
    console.error('Login error:', error);
    res.status(400).json({ error: 'Login failed. Please try again.' });
  }
};

exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, role, userData } = req.body;
    console.log('📝 Registration attempt:', email, role);

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
      emailVerified: true, // Auto-verify for now to simplify
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

    console.log('✅ User registered successfully:', email);

    res.status(201).json({
      message: 'User registered successfully',
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

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    console.log('📧 Email verification attempt');

    // Simple implementation - just return success
    res.json({
      message: 'Email verified successfully (simulated)',
      verified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📧 Resend verification for:', email);

    res.json({
      message: 'Verification email sent successfully (simulated)',
      email: email
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔑 Forgot password for:', email);

    res.json({
      message: 'Password reset email sent successfully (simulated)',
      email: email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log('🔑 Reset password with token');

    res.json({
      message: 'Password reset successfully (simulated)',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
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
