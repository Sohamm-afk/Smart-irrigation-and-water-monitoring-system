// Firebase configuration
// Replace with your own Firebase project credentials to enable realtime sync.
// Without credentials, the app runs in full simulation mode.
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Only initialize Firebase if config is provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.databaseURL
);

let app, db, auth;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
}

export { db, auth };
export default app;
