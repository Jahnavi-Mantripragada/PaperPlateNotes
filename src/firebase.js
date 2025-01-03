import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, set, push, onValue } from "firebase/database";

// Handle environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "mockApiKey",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "mockAuthDomain",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://mock.firebaseio.com", // Ensure this is valid
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "mockProjectId",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "mockStorageBucket",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mockSenderId",
  appId: process.env.VITE_FIREBASE_APP_ID || "mockAppId",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, ref, set, push, onValue, signInAnonymously };
