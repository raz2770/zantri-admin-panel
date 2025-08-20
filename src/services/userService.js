// Admin user service for managing users
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

// Subscription plan types
export const PLAN_TYPES = {
  FREE_TRIAL: '0',
  ONE_MONTH: '1',
  THREE_MONTHS: '2',
  SIX_MONTHS: '3',
  TWELVE_MONTHS: '4'
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  TRIAL: 'trial'
};

// Get all users
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const users = [];
    snapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt),
        lastLogin: userData.lastLogin?.toDate?.() || new Date(userData.lastLogin),
        subscriptionExpiry: userData.subscriptionExpiry?.toDate?.() || userData.subscriptionExpiry,
        subscriptionActivatedAt: userData.subscriptionActivatedAt?.toDate?.() || userData.subscriptionActivatedAt
      });
    });
    
    return { success: true, users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userDoc.data();
    return {
      success: true,
      user: {
        id: userDoc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt),
        lastLogin: userData.lastLogin?.toDate?.() || new Date(userData.lastLogin),
        subscriptionExpiry: userData.subscriptionExpiry?.toDate?.() || userData.subscriptionExpiry,
        subscriptionActivatedAt: userData.subscriptionActivatedAt?.toDate?.() || userData.subscriptionActivatedAt
      }
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: error.message };
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const { username, mobileNumber, password, hasSubscription = false } = userData;
    
    // Create email from mobile number
    const email = `${mobileNumber}@zantri.com`;
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Create user document in Firestore
    const newUserData = {
      uid: firebaseUser.uid,
      username: username,
      mobileNumber: mobileNumber,
      email: email,
      hasSubscription: hasSubscription,
      subscriptionExpiry: null,
      subscriptionPlan: null,
      subscriptionStatus: null,
      devices: [],
      maxDevices: 2,
      freeTrialUsed: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      createdBy: 'admin', // Mark as admin created
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
    
    return { 
      success: true, 
      message: 'User created successfully',
      userId: firebaseUser.uid
    };
  } catch (error) {
    console.error('Error creating user:', error);
    let errorMessage = 'Failed to create user';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Mobile number already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use at least 6 characters';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Update user
export const updateUser = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    
    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
};

// Delete user
export const deleteUserAccount = async (userId) => {
  try {
    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', userId));
    
    // Note: To delete from Firebase Auth, you need admin SDK
    // For now, we'll just delete from Firestore
    
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

// Update user subscription
export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    const { planId, expiryDate, transactionId, paymentMethod, activateNow = false } = subscriptionData;
    
    const updateData = {
      hasSubscription: activateNow,
      subscriptionPlan: planId,
      subscriptionStatus: activateNow ? 
        (planId === PLAN_TYPES.FREE_TRIAL ? SUBSCRIPTION_STATUS.TRIAL : SUBSCRIPTION_STATUS.ACTIVE) :
        SUBSCRIPTION_STATUS.PENDING,
      updatedAt: serverTimestamp()
    };
    
    if (expiryDate) {
      updateData.subscriptionExpiry = new Date(expiryDate);
    }
    
    if (activateNow) {
      updateData.subscriptionActivatedAt = serverTimestamp();
    }
    
    if (transactionId) {
      updateData.paymentTransactionId = transactionId;
      updateData.paymentMethod = paymentMethod || 'ADMIN_ASSIGNED';
      updateData.paymentDate = serverTimestamp();
    }
    
    if (planId === PLAN_TYPES.FREE_TRIAL) {
      updateData.freeTrialUsed = true;
    }
    
    await updateDoc(doc(db, 'users', userId), updateData);
    
    return { success: true, message: 'Subscription updated successfully' };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message };
  }
};

// Reset user password
export const resetUserPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error sending password reset:', error);
    return { success: false, error: error.message };
  }
};

// Get user statistics
export const getUserStats = async () => {
  try {
    const usersRef = collection(db, 'users');
    const allUsersSnapshot = await getDocs(usersRef);
    
    let totalUsers = 0;
    let activeSubscriptions = 0;
    let trialUsers = 0;
    let expiredUsers = 0;
    
    const now = new Date();
    
    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      totalUsers++;
      
      if (userData.hasSubscription) {
        const expiryDate = userData.subscriptionExpiry?.toDate?.() || new Date(userData.subscriptionExpiry);
        if (expiryDate > now) {
          if (userData.subscriptionPlan === PLAN_TYPES.FREE_TRIAL) {
            trialUsers++;
          } else {
            activeSubscriptions++;
          }
        } else {
          expiredUsers++;
        }
      }
    });
    
    return {
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions,
        trialUsers,
        expiredUsers,
        freeUsers: totalUsers - activeSubscriptions - trialUsers - expiredUsers
      }
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { success: false, error: error.message };
  }
};

// Bulk operations
export const bulkUpdateUsers = async (userIds, updates) => {
  try {
    const batch = writeBatch(db);
    
    userIds.forEach((userId) => {
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    
    return { success: true, message: `${userIds.length} users updated successfully` };
  } catch (error) {
    console.error('Error bulk updating users:', error);
    return { success: false, error: error.message };
  }
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUserAccount,
  updateUserSubscription,
  resetUserPassword,
  getUserStats,
  bulkUpdateUsers,
  PLAN_TYPES,
  SUBSCRIPTION_STATUS
};

export default userService;
