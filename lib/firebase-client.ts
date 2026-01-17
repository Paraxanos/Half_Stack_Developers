// src/lib/firebase-client.ts
import { getFirestore } from 'firebase/firestore';
import { app } from './firebase';

// Firestore instance for client-side use
export const db = getFirestore(app);