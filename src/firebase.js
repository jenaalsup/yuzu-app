   // src/firebase.js
   import { initializeApp } from 'firebase/app';
   import { getDatabase, ref, set } from 'firebase/database';

   const firebaseConfig = {
       apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
       authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
       databaseURL: `https://${import.meta.env.PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
       projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
       storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
       messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
       appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
   };

   const app = initializeApp(firebaseConfig);
   const database = getDatabase(app);

   export { database, ref, set };