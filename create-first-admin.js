// Script to create the first admin account
// Run this in your browser console on the admin panel login page

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from './src/firebaseConfig';

async function createFirstAdmin() {
  const email = prompt('Enter admin email:');
  const password = prompt('Enter admin password:');
  
  if (!email || !password) {
    console.error('Email and password are required');
    return;
  }
  
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create admin document in Firestore
    await setDoc(doc(db, 'admins', user.uid), {
      email: email,
      role: 'admin',
      permissions: ['users', 'subscriptions', 'analytics'],
      createdAt: new Date(),
      createdBy: 'setup-script'
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('Email:', email);
    console.log('UID:', user.uid);
    console.log('You can now login with these credentials.');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
  }
}

// Uncomment the line below and run this script to create your first admin
// createFirstAdmin();
