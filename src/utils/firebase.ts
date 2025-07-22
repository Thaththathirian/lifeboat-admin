// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCi7QqGACe1eUcdrobs-_2iGzfc2PgMtyY",
  authDomain: "lifeboat-94da5.firebaseapp.com",
  projectId: "lifeboat-94da5",
  storageBucket: "lifeboat-94da5.firebasestorage.app",
  messagingSenderId: "644249374099",
  appId: "1:644249374099:web:5f1c141461277a78f56c66",
  measurementId: "G-BTXPWCM79E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics (only in production)
let analytics;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Initialize reCAPTCHA verifier
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const initializeRecaptcha = (containerId: string) => {
  try {
    // Clear existing verifier if it exists
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        console.log('Clearing existing reCAPTCHA verifier');
      }
      recaptchaVerifier = null;
    }

    // Check if container exists
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`reCAPTCHA container with id '${containerId}' not found`);
      throw new Error('reCAPTCHA container not found');
    }

    // Create new verifier
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });

    console.log('reCAPTCHA verifier initialized successfully');
    return recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    throw error;
  }
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string, containerId: string) => {
  try {
    console.log('Sending OTP to:', phoneNumber);
    
    // Ensure reCAPTCHA is properly initialized
    const verifier = initializeRecaptcha(containerId);
    
    // Render reCAPTCHA if not already rendered
    try {
      await verifier.render();
      console.log('reCAPTCHA rendered successfully');
    } catch (renderError) {
      console.log('reCAPTCHA already rendered or render failed:', renderError);
    }
    
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    
    console.log('OTP sent successfully');
    
    return {
      success: true,
      confirmationResult,
      message: 'OTP sent successfully'
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send OTP';
    if (error instanceof Error) {
      if (error.message.includes('reCAPTCHA')) {
        errorMessage = 'reCAPTCHA verification failed. Please try again.';
      } else if (error.message.includes('invalid-phone-number')) {
        errorMessage = 'Invalid phone number format. Please enter a valid number.';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Too many attempts. Please wait before trying again.';
      } else if (error.message.includes('BILLING_NOT_ENABLED')) {
        errorMessage = 'Firebase billing not enabled. Please enable billing in Firebase Console.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Verify OTP
export const verifyOTP = async (confirmationResult: any, otp: string) => {
  try {
    console.log('Verifying OTP...');
    const result = await confirmationResult.confirm(otp);
    console.log('OTP verified successfully');
    
    return {
      success: true,
      user: result.user,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    let errorMessage = 'Invalid OTP';
    if (error instanceof Error) {
      if (error.message.includes('invalid-verification-code')) {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.message.includes('expired')) {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Clear reCAPTCHA
export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
      console.log('reCAPTCHA cleared successfully');
    } catch (error) {
      console.log('Error clearing reCAPTCHA:', error);
    }
    recaptchaVerifier = null;
  }
};

// Get Firebase ID token for API authentication
export const getFirebaseIdToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No current user found');
      return null;
    }
    
    const idToken = await currentUser.getIdToken();
    console.log('Firebase ID token retrieved successfully');
    return idToken;
  } catch (error) {
    console.error('Error getting Firebase ID token:', error);
    return null;
  }
};

export { auth, app, analytics }; 