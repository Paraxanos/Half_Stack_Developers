import admin from 'firebase-admin';

let adminAuth, adminDb;

if (!admin.apps.length) {
  try {
    // Check if required environment variables are present
    const hasProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const hasClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!hasProjectId || !hasClientEmail || !hasPrivateKey) {
      console.warn('⚠️  Firebase Admin SDK: Missing environment variables.');
      console.warn('⚠️  To enable real Firebase operations:');
      console.warn('   1. Go to Firebase Console → Project Settings → Service Accounts');
      console.warn('   2. Click "Generate new private key"');
      console.warn('   3. Copy the values to .env.local (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
      console.warn('⚠️  Running in MOCK MODE - no data will be saved to Firestore.\n');

      // Create mock objects for development when Firebase is not configured
      adminAuth = {
        verifyIdToken: async (token: string) => {
          console.log('📝 [MOCK] verifyIdToken called with token:', token.substring(0, 20) + '...');
          // Return a mock decoded token for development
          return { 
            uid: 'mock-user-id-' + Date.now(), 
            email: 'user@example.com',
            name: 'Mock User'
          };
        }
      };

      adminDb = {
        collection: (collectionName: string) => ({
          doc: (docId: string) => ({
            get: async () => {
              console.log(`📝 [MOCK] Firestore get: ${collectionName}/${docId}`);
              return {
                exists: false,
                data: () => ({}),
              };
            },
            set: async (data: any) => {
              console.log(`📝 [MOCK] Firestore set: ${collectionName}/${docId}`, data);
              return { writeTime: new Date() };
            },
            update: async (data: any) => {
              console.log(`📝 [MOCK] Firestore update: ${collectionName}/${docId}`, data);
              return { writeTime: new Date() };
            },
          }),
          add: async (data: any) => {
            console.log(`📝 [MOCK] Firestore add: ${collectionName}`, data);
            return { id: 'mock-doc-id-' + Date.now() };
          },
          limit: (num: number) => ({
            get: async () => {
              console.log(`📝 [MOCK] Firestore query: ${collectionName} limit ${num}`);
              return {
                docs: [],
              };
            },
          }),
          where: (field: string, op: string, value: any) => ({
            get: async () => {
              console.log(`📝 [MOCK] Firestore query: ${collectionName} where ${field} ${op} ${value}`);
              return { docs: [] };
            },
            orderBy: (field: string, dir: string) => ({
              get: async () => {
                console.log(`📝 [MOCK] Firestore query: ${collectionName} orderBy ${field} ${dir}`);
                return { docs: [] };
              },
            }),
          }),
          orderBy: (field: string, dir: string) => ({
            get: async () => {
              console.log(`📝 [MOCK] Firestore query: ${collectionName} orderBy ${field} ${dir}`);
              return { docs: [] };
            },
          }),
        }),
      };
    } else {
      // Production mode: Initialize Firebase Admin SDK
      const privateKey = hasPrivateKey.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: hasProjectId,
          clientEmail: hasClientEmail,
          privateKey: privateKey,
        }),
      });

      adminAuth = admin.auth();
      adminDb = admin.firestore();
      
      // Enable offline persistence for Firestore in production
      adminDb.settings({ ignoreUndefinedProperties: true });
      
      console.log('✅ Firebase Admin SDK initialized successfully');
      console.log(`🔥 Project ID: ${hasProjectId}`);
      console.log(`📧 Service Account: ${hasClientEmail}`);
    }
  } catch (error: any) {
    console.error('❌ Firebase admin initialization error:', error.message);
    console.error('📋 Check your .env.local file for correct Firebase credentials');
    console.warn('⚠️  Using mock Firebase services for development.');

    // Create mock objects for development when Firebase initialization fails
    adminAuth = {
      verifyIdToken: async (token: string) => {
        console.log('📝 [MOCK] verifyIdToken (fallback)');
        return { uid: 'mock-user-id', email: 'mock@example.com' };
      }
    };

    adminDb = {
      collection: (collectionName: string) => ({
        doc: (docId: string) => ({
          get: async () => ({
            exists: false,
            data: () => ({}),
          }),
        }),
        limit: (num: number) => ({
          get: async () => ({
            docs: [],
          }),
        }),
      }),
    };
  }
} else {
  // If already initialized, use the existing instance
  adminAuth = admin.auth();
  adminDb = admin.firestore();
}

export { adminAuth, adminDb };
export default admin;