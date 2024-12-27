import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
    databaseURL: "https://yuzu-app-8b8cc-default-rtdb.firebaseio.com",
};


// Only initialize Firebase if we're in the browser
const app = typeof window !== 'undefined' 
    ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
    : undefined;

// Only initialize services if app exists
export const db = app ? getDatabase(app) : undefined;
export const auth = app ? getAuth(app) : undefined;