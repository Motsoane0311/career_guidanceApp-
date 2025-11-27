const admin = require('firebase-admin');

// Load the new service account
const serviceAccount = require('./firebase-service-account.json');

console.log('🔄 Initializing Firebase...');
console.log('📁 Using project:', serviceAccount.project_id);

try {
  // Initialize Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://careerguidanceplatform-14ca1.firebaseio.com'
  });

  console.log('✅ Firebase initialized successfully');
  
  const db = admin.firestore();
  const auth = admin.auth();
  
  console.log('🔥 Firestore connected');
  console.log('🔑 Auth service ready');

  module.exports = { admin, db, auth };
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  throw error;
}