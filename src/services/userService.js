// Admin user service — Go backend REST API
import api, { getErrorMessage } from './apiClient';

export const PLAN_TYPES = {
  FREE_TRIAL: '0',
  ONE_MONTH: '1',
  THREE_MONTHS: '2',
  SIX_MONTHS: '3',
  TWELVE_MONTHS: '4',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  TRIAL: 'trial',
};

const normalizeUser = (user) => {
  if (!user) return null;
  const id = user.id || user._id;
  return {
    ...user,
    id,
    createdAt: user.createdAt ? new Date(user.createdAt) : null,
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
    subscriptionExpiry: user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null,
    subscriptionActivatedAt: user.subscriptionActivatedAt
      ? new Date(user.subscriptionActivatedAt)
      : null,
  };
};

export const getAllUsers = async () => {
  try {
    const { data } = await api.get('/admin/users');
    const users = (data.users || []).map(normalizeUser);
    return { success: true, users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to fetch users') };
  }
};

export const getUserById = async (userId) => {
  try {
    const { data } = await api.get(`/admin/users/${encodeURIComponent(userId)}`);
    if (!data.user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, user: normalizeUser(data.user) };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to fetch user') };
  }
};

export const createUser = async (userData) => {
  try {
    const { username, mobileNumber, password, hasSubscription = false } = userData;
    const { data } = await api.post('/admin/users', {
      username,
      mobileNumber,
      password,
      hasSubscription,
    });
    return {
      success: true,
      message: data.message || 'User created successfully',
      userId: data.user?.id,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to create user') };
  }
};

export const updateUser = async (userId, updates) => {
  try {
    await api.patch(`/admin/users/${encodeURIComponent(userId)}`, updates);
    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to update user') };
  }
};

export const deleteUserAccount = async (userId) => {
  try {
    await api.delete(`/admin/users/${encodeURIComponent(userId)}`);
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to delete user') };
  }
};

export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    await api.patch(`/admin/users/${encodeURIComponent(userId)}/subscription`, subscriptionData);
    return { success: true, message: 'Subscription updated successfully' };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to update subscription') };
  }
};

export const resetUserPassword = async (userId, password) => {
  try {
    await api.patch(`/admin/users/${encodeURIComponent(userId)}/password`, { password });
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to reset password') };
  }
};

export const getUserStats = async () => {
  try {
    const { data } = await api.get('/admin/stats');
    return { success: true, stats: data.stats };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to fetch stats') };
  }
};

export const bulkUpdateUsers = async (userIds, updates) => {
  try {
    const { data } = await api.post('/admin/users/bulk', { userIds, updates });
    return {
      success: true,
      message: data.message || `${userIds.length} users updated successfully`,
    };
  } catch (error) {
    console.error('Error bulk updating users:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to bulk update users') };
  }
};

export const getAllTransactions = async () => {
  try {
    const { data } = await api.get('/admin/transactions');
    return { success: true, transactions: data.transactions || [] };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to fetch transactions') };
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
  getAllTransactions,
  PLAN_TYPES,
  SUBSCRIPTION_STATUS,
};

export default userService;
