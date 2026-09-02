// Admin authentication service — Go backend JWT
import api, { clearTokens, getRefreshToken, setTokens, getErrorMessage } from './apiClient';

export const loginAdmin = async (mobileNumber, password) => {
  try {
    const { data } = await api.post('/admin/auth/login', { mobileNumber, password });

    await setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return {
      success: true,
      admin: data.admin,
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, error: getErrorMessage(error, 'Login failed') };
  }
};

export const logoutAdmin = async () => {
  try {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best-effort server logout
    }
    clearTokens();
    return { success: true };
  } catch (error) {
    console.error('Admin logout error:', error);
    clearTokens();
    return { success: false, error: getErrorMessage(error, 'Logout failed') };
  }
};

export const createAdmin = async (mobileNumber, password, adminData = {}) => {
  try {
    const username = adminData.username || `admin_${mobileNumber}`;
    const { data } = await api.post('/admin/admins', {
      username,
      mobileNumber,
      password,
      role: adminData.role || 'admin',
    });

    return { success: true, message: data.message || 'Admin account created successfully' };
  } catch (error) {
    console.error('Create admin error:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to create admin') };
  }
};

export const bootstrapAdmin = async (secret, mobileNumber, password, username) => {
  try {
    const { data } = await api.post('/admin/bootstrap', {
      secret,
      username: username || `admin_${mobileNumber}`,
      mobileNumber,
      password,
    });
    return { success: true, message: data.message || 'Admin account created successfully' };
  } catch (error) {
    console.error('Bootstrap admin error:', error);
    return { success: false, error: getErrorMessage(error, 'Failed to bootstrap admin') };
  }
};

export const checkAdminAuth = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return { isAuthenticated: false };
    }

    const { data: tokenData } = await api.post('/auth/refresh-token', { refreshToken });
    setTokens({
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || refreshToken,
    });

    const { data } = await api.get('/admin/me');
    if (data.admin) {
      return { isAuthenticated: true, admin: data.admin };
    }

    clearTokens();
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error checking admin status:', error);
    clearTokens();
    return { isAuthenticated: false };
  }
};

const authService = {
  loginAdmin,
  logoutAdmin,
  createAdmin,
  bootstrapAdmin,
  checkAdminAuth,
};

export default authService;
