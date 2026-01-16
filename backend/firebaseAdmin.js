// backend/firebaseAdmin.js
const admin = require('firebase-admin');

let serviceAccount;

// Check if running with environment variables (production) or local file (development)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('./firebase-service-account.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;