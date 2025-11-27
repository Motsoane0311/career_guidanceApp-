const admin = require('firebase-admin');

console.log('🔄 Initializing Firebase...');

try {
  let serviceAccount;
  
  // Check if we're in production (Render) with environment variables
  if (process.env.FIREBASE_PRIVATE_KEY) {
    console.log('📁 Using environment variables for Firebase...');
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "careerguidanceplatform-14ca1",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };
  } else {
    // Use local service account file for development
    console.log('📁 Using local service account file...');
    serviceAccount = require('./firebase-service-account.json');
  }

  console.log('📁 Using project:', serviceAccount.project_id);

  // Initialize Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
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