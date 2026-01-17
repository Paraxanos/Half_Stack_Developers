// backend/firebaseAdmin.js
require('dotenv').config();
const admin = require('firebase-admin');

let serviceAccount;

// Check if running with environment variables (production) or local file (development)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:', e.message);
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require('./firebase-service-account.json');
  } catch (e) {
    console.error('❌ Missing Firebase credentials!');
    console.error('Set FIREBASE_SERVICE_ACCOUNT env variable or provide firebase-service-account.json file');
    process.exit(1);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;