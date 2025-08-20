// Simple admin account creation script for Zantri
const readline = require('readline');

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

async function createAdminInstructions() {
  try {
    console.log('\n🔧 Zantri Admin Account Creator');
    console.log('================================\n');
    
    console.log('This script will guide you through creating an admin account.');
    console.log('You have two options:\n');
    
    console.log('Option 1: Manual Creation via Firebase Console (Recommended)');
    console.log('Option 2: Use the Admin Panel Settings Page\n');
    
    const choice = await askQuestion('Which option would you like? (1 or 2): ');
    
    if (choice === '1') {
      console.log('\n📋 Manual Creation Steps:');
      console.log('=========================\n');
      
      const email = await askQuestion('Enter your desired admin email: ');
      const password = await askQuestion('Enter your desired admin password: ');
      
      console.log('\n🔗 Firebase Console Steps:');
      console.log('1. Go to https://console.firebase.google.com/');
      console.log('2. Select your "zantri" project');
      console.log('3. Go to Authentication > Users');
      console.log('4. Click "Add user"');
      console.log('5. Enter email:', email);
      console.log('6. Enter password:', password);
      console.log('7. Click "Add user"');
      console.log('8. Copy the User UID from the created user');
      console.log('\n9. Go to Firestore Database');
      console.log('10. Create a new collection called "admins"');
      console.log('11. Create a document with the User UID as the Document ID');
      console.log('12. Add these fields:');
      console.log('    - email (string):', email);
      console.log('    - role (string): admin');
      console.log('    - permissions (array): ["users", "subscriptions", "analytics"]');
      console.log('    - createdAt (timestamp): now');
      console.log('    - isActive (boolean): true');
      
    } else if (choice === '2') {
      console.log('\n📱 Admin Panel Setup Steps:');
      console.log('===========================\n');
      
      console.log('1. Start the admin panel: npm start');
      console.log('2. Open http://localhost:3000');
      console.log('3. On the login page, enter any temporary credentials');
      console.log('4. Go to Settings page');
      console.log('5. Use the "Create New Admin" form');
      console.log('6. Logout and login with your new admin credentials');
      
    } else {
      console.log('\n❌ Invalid choice. Please run the script again and choose 1 or 2.');
    }
    
    console.log('\n✅ Setup Instructions Complete!');
    console.log('\n🚀 After creating your admin account:');
    console.log('   • Start the admin panel: npm start');
    console.log('   • Open http://localhost:3000');
    console.log('   • Login with your admin credentials');
    console.log('   • Begin managing users and subscriptions!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Alternative: Direct Firestore creation (requires firebase package)
async function createAdminDirectly() {
  try {
    // Check if firebase is available
    let firebase;
    try {
      firebase = require('firebase/app');
    } catch (e) {
      console.log('\n❌ Firebase package not found. Please run: npm install firebase');
      return false;
    }
    
    const { initializeApp } = require('firebase/app');
    const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
    const { getFirestore, doc, setDoc } = require('firebase/firestore');
    
    // Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyDKXR4Y3T2uMW-9VA-Zb82oP9N_e1GDbbI",
      authDomain: "zantri.firebaseapp.com",
      projectId: "zantri",
      storageBucket: "zantri.firebasestorage.app",
      messagingSenderId: "223646735076",
      appId: "1:223646735076:web:6e9b1333332f20ea3daaf1"
    };
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('\n🔧 Direct Admin Creation');
    console.log('========================\n');
    
    const email = await askQuestion('Enter admin email: ');
    const password = await askQuestion('Enter admin password (min 6 chars): ');
    
    if (!email.includes('@') || password.length < 6) {
      console.log('❌ Invalid email or password too short');
      return false;
    }
    
    console.log('\n🔄 Creating admin account...');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const adminData = {
      email: email,
      role: 'admin',
      permissions: ['users', 'subscriptions', 'analytics'],
      createdAt: new Date(),
      isActive: true
    };
    
    await setDoc(doc(db, 'admins', user.uid), adminData);
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email:', email);
    console.log('🆔 UID:', user.uid);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('\n🔄 Attempting direct admin creation...');
  
  const directSuccess = await createAdminDirectly();
  
  if (!directSuccess) {
    console.log('\n📝 Showing manual setup instructions instead...');
    await createAdminInstructions();
  }
}

// Run the script
main();
