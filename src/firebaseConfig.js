// Firebase configuration for admin panel (web)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Same Firebase config as the mobile app
const firebaseConfig = {
  apiKey: "AIzaSyDKXR4Y3T2uMW-9VA-Zb82oP9N_e1GDbbI",
  authDomain: "zantri.firebaseapp.com",
  projectId: "zantri",
  storageBucket: "zantri.firebasestorage.app",
  messagingSenderId: "223646735076",
  appId: "1:223646735076:web:6e9b1333332f20ea3daaf1",
  measurementId: "G-KTVSMBKFP3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
