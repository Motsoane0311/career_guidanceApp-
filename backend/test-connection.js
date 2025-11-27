const { db } = require('./config/firebase');

async function testFirebase() {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test if we can access Firestore
    const testRef = db.collection('users');
    const snapshot = await testRef.limit(1).get();
    
    console.log('✅ Firebase connection successful!');
    console.log('📊 Can read from Firestore');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    return false;
  }
}

testFirebase().then(success => {
  if (success) {
    console.log('🎉 All tests passed! Firebase is working correctly.');
  } else {
    console.log('💥 Firebase connection failed.');
  }
});