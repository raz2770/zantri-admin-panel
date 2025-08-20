// Admin authentication service
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Admin login
export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user is admin
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (!adminDoc.exists()) {
      await signOut(auth);
      return { success: false, error: 'Access denied. Admin privileges required.' };
    }
    
    const adminData = adminDoc.data();
    return { 
      success: true, 
      admin: {
        id: user.uid,
        email: user.email,
        ...adminData
      }
    };
  } catch (error) {
    console.error('Admin login error:', error);
    let errorMessage = 'Login failed';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Admin logout
export const logoutAdmin = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Admin logout error:', error);
    return { success: false, error: error.message };
  }
};

// Create admin account (only use this once to create initial admin)
export const createAdmin = async (email, password, adminData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create admin document
    await setDoc(doc(db, 'admins', user.uid), {
      email: email,
      role: 'admin',
      permissions: ['users', 'subscriptions', 'analytics'],
      createdAt: new Date(),
      ...adminData
    });
    
    return { success: true, message: 'Admin account created successfully' };
  } catch (error) {
    console.error('Create admin error:', error);
    return { success: false, error: error.message };
  }
};

// Check authentication status
export const checkAdminAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      
      if (user) {
        // Check if user is admin
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            resolve({
              isAuthenticated: true,
              admin: {
                id: user.uid,
                email: user.email,
                ...adminData
              }
            });
          } else {
            await signOut(auth);
            resolve({ isAuthenticated: false });
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          resolve({ isAuthenticated: false });
        }
      } else {
        resolve({ isAuthenticated: false });
      }
    });
  });
};

const authService = {
  loginAdmin,
  logoutAdmin,
  createAdmin,
  checkAdminAuth
};

export default authService;
