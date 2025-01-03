import dotenv from "dotenv";
dotenv.config(); // Load variables from .env

const fetch = require("node-fetch");
const { FetchProvider } = require("@firebase/auth");

// Provide fetch implementation to Firebase
FetchProvider.initialize(fetch);


// Set fallback values for testing
global.importMetaEnv = {
    VITE_FIREBASE_API_KEY: "mockApiKey",
    VITE_FIREBASE_AUTH_DOMAIN: "mockAuthDomain",
    VITE_FIREBASE_DATABASE_URL: "https://mock.firebaseio.com", // Add a valid mock URL
    VITE_FIREBASE_PROJECT_ID: "mockProjectId",
    VITE_FIREBASE_STORAGE_BUCKET: "mockStorageBucket",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "mockSenderId",
    VITE_FIREBASE_APP_ID: "mockAppId",
  };
  