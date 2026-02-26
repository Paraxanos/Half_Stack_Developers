// backend/firebaseAdmin.js
require('dotenv').config();
const admin = require('firebase-admin');

let serviceAccount;

// Production-ready Firebase Admin SDK initialization
// Supports multiple configuration methods for different deployment scenarios

try {
  // Method 1: Environment variables (Recommended for Vercel/production)
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.log('🔥 Initializing Firebase Admin SDK with environment variables...');
    
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    // Optional: Add additional service account fields if provided
    if (process.env.FIREBASE_CLIENT_ID) {
      serviceAccount.client_id = process.env.FIREBASE_CLIENT_ID;
    }
    if (process.env.FIREBASE_PRIVATE_KEY_ID) {
      serviceAccount.private_key_id = process.env.FIREBASE_PRIVATE_KEY_ID;
    }

    console.log('✅ Firebase Admin SDK initialized (env variables)');
    console.log(`   Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log(`   Account: ${process.env.FIREBASE_CLIENT_EMAIL}`);
  }
  // Method 2: JSON string (Alternative for Vercel)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('🔥 Initializing Firebase Admin SDK with FIREBASE_SERVICE_ACCOUNT...');
    
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('✅ Firebase Admin SDK initialized (JSON string)');
      console.log(`   Project: ${serviceAccount.project_id}`);
      console.log(`   Account: ${serviceAccount.client_email}`);
    } catch (parseError) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT format');
    }
  }
  // Method 3: Local JSON file (Development)
  else {
    console.log('🔥 Initializing Firebase Admin SDK with local JSON file...');
    
    try {
      serviceAccount = require('./firebase-service-account.json');
      console.log('✅ Firebase Admin SDK initialized (local file)');
      console.log(`   Project: ${serviceAccount.project_id}`);
      console.log(`   Account: ${serviceAccount.client_email}`);
    } catch (fileError) {
      if (fileError.code === 'MODULE_NOT_FOUND') {
        console.error('❌ firebase-service-account.json not found!');
        console.error('');
        console.error('📋 To set up Firebase:');
        console.error('   1. Go to Firebase Console → Project Settings → Service Accounts');
        console.error('   2. Click "Generate new private key"');
        console.error('   3. Save the JSON file as backend/firebase-service-account.json');
        console.error('');
        console.error('   OR set these environment variables:');
        console.error('   - FIREBASE_CLIENT_EMAIL');
        console.error('   - FIREBASE_PRIVATE_KEY');
        console.error('   - NEXT_PUBLIC_FIREBASE_PROJECT_ID');
        throw new Error('Missing Firebase credentials');
      }
      throw fileError;
    }
  }

  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  // Configure Firestore
  const db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });

  console.log('✅ Firebase Admin SDK ready for production!');
  console.log('');

} catch (error) {
  console.error('');
  console.error('❌ Firebase Admin SDK Initialization Failed');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('Error:', error.message);
  console.error('');
  console.error('📋 Troubleshooting:');
  console.error('   1. Check your .env.local file has correct Firebase credentials');
  console.error('   2. Verify FIREBASE_PRIVATE_KEY includes BEGIN/END markers');
  console.error('   3. Ensure no extra spaces or line breaks in env values');
  console.error('   4. For Vercel: Add env vars in Vercel dashboard');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('');
  
  // Exit with error in production, continue with mock in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

module.exports = admin;