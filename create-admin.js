// Script to create admin account automatically
const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
// You'll need to download the service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate new private key
const serviceAccount = {
  "type": "service_account",
  "project_id": "zantri",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID || "your-private-key-id",
  "private_key": (process.env.FIREBASE_PRIVATE_KEY || "your-private-key").replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-xxxxx@zantri.iam.gserviceaccount.com",
  "client_id": process.env.FIREBASE_CLIENT_ID || "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40zantri.iam.gserviceaccount.com`
};

// Alternative: Simple script using client SDK for development
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, doc, setDoc, connectFirestoreEmulator } = require('firebase/firestore');

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdminAccount() {
  try {
    console.log('\n🔧 Zantri Admin Account Creator');
    console.log('================================\n');
    
    // Get admin details
    const email = await askQuestion('Enter admin email: ');
    
    if (!email || !email.includes('@')) {
      console.log('❌ Please enter a valid email address');
      rl.close();
      return;
    }
    
    const password = await askQuestion('Enter admin password (min 6 characters): ');
    
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      rl.close();
      return;
    }
    
    console.log('\n🔄 Creating admin account...\n');
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth user created');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);
    
    // Create admin document in Firestore
    const adminData = {
      email: email,
      role: 'admin',
      permissions: ['users', 'subscriptions', 'analytics', 'settings'],
      createdAt: new Date(),
      createdBy: 'setup-script',
      lastLogin: null,
      isActive: true
    };
    
    await setDoc(doc(db, 'admins', user.uid), adminData);
    
    console.log('✅ Admin document created in Firestore');
    console.log('\n🎉 SUCCESS! Admin account created successfully!');
    console.log('\n📋 Account Details:');
    console.log('   📧 Email:', email);
    console.log('   🆔 UID:', user.uid);
    console.log('   🔑 Role: admin');
    
    console.log('\n� Next Steps:');
    console.log('   1. Start the admin panel: npm start');
    console.log('   2. Open http://localhost:3000 in your browser');
    console.log('   3. Login with your new admin credentials');
    console.log('   4. Start managing users and subscriptions!');
    
  } catch (error) {
    console.error('\n❌ Error creating admin account:');
    console.error('   Message:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 Solution: This email is already registered.');
      console.log('   - Try using a different email address');
      console.log('   - Or check if this admin account already exists');
    } else if (error.code === 'auth/weak-password') {
      console.log('\n💡 Solution: Use a stronger password (at least 6 characters)');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n💡 Solution: Please check your email format');
    } else if (error.code === 'auth/network-request-failed') {
      console.log('\n💡 Solution: Check your internet connection');
    }
  } finally {
    rl.close();
    setTimeout(() => process.exit(), 1000);
  }
}

// Run the script
console.log('🔄 Initializing Firebase...');
createAdminAccount();
