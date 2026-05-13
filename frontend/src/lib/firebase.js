import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

let app;
let analytics;

// Initialize Firebase only if the config is provided (prevents crashing if env vars are missing)
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    try {
        app = initializeApp(firebaseConfig);
        analytics = getAnalytics(app);
        console.log("[Firebase] Analytics initialized successfully.");
    } catch (e) {
        console.error("[Firebase] Initialization error:", e);
    }
} else {
    console.warn("[Firebase] Missing configuration. Analytics is disabled.");
}

/**
 * Helper to log custom events safely
 * @param {string} eventName 
 * @param {object} params 
 */
export const logCustomEvent = (eventName, params = {}) => {
    if (analytics) {
        logEvent(analytics, eventName, params);
        // console.log(`[Firebase] Event logged: ${eventName}`, params); // Uncomment for debugging
    }
};

export { app, analytics };
