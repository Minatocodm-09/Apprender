// =====================================
// FIREBASE INITIALIZATION - GLOBAL
// =====================================
// This file initializes Firebase and sets up global auth state tracking.
// It runs on every page and makes Firebase services available globally.

// Import Firebase SDK modules from CDN (v12.8.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlkACGhogjYVF3JsW9xfWOgJSEZ-8PK-Q",
  authDomain: "aprender-abbd8.firebaseapp.com",
  projectId: "aprender-abbd8",
  storageBucket: "aprender-abbd8.firebasestorage.app",
  messagingSenderId: "531429692726",
  appId: "1:531429692726:web:8974cb80d9634ebf304f97",
  measurementId: "G-10R8RT2R9P"
};

// =====================================
// STEP 1: INITIALIZE FIREBASE
// =====================================
window.firebaseApp = initializeApp(firebaseConfig);
window.firebaseAuth = getAuth(window.firebaseApp);
window.firebaseDB = getFirestore(window.firebaseApp);

console.log('✅ Firebase initialized');

// =====================================
// STEP 6: TRACK AUTH STATE GLOBALLY
// =====================================
// This listener runs on every page and tracks the current user.
// It updates window.currentUser whenever auth state changes.

window.currentUser = null; // Initialize as null (not logged in)

onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    // User is signed in
    window.currentUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    console.log('✅ User logged in:', user.email);

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('firebaseAuthChanged', {
      detail: { user: window.currentUser }
    }));
  } else {
    // User is signed out
    window.currentUser = null;
    console.log('ℹ️ User not logged in');

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('firebaseAuthChanged', {
      detail: { user: null }
    }));
  }
});
