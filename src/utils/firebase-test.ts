// Simple Firebase test to verify configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCi7QqGACe1eUcdrobs-_2iGzfc2PgMtyY",
  authDomain: "lifeboat-94da5.firebaseapp.com",
  projectId: "lifeboat-94da5",
  storageBucket: "lifeboat-94da5.firebasestorage.app",
  messagingSenderId: "644249374099",
  appId: "1:644249374099:web:5f1c141461277a78f56c66",
  measurementId: "G-BTXPWCM79E"
};

// Test Firebase initialization
export const testFirebase = () => {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
    console.log('✅ Auth service available:', !!auth);
    return { success: true, app, auth };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return { success: false, error };
  }
};

// Test reCAPTCHA loading
export const testRecaptcha = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6LcNOYcrAAAAACohTUXyMG1kPT06KDLrvMXh8ArS';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ reCAPTCHA script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('❌ reCAPTCHA script failed to load');
      reject(new Error('reCAPTCHA script failed to load'));
    };
    
    document.head.appendChild(script);
  });
}; 