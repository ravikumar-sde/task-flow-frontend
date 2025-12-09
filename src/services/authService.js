import api from './api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const authService = {
  // Sign up with email and password
  signup: async (name, email, password) => {
    const response = await api.post('/auth/signup', {
      name,
      email,
      password,
    });

    console.log('🔐 Signup Response:', response.data);
    console.log('🔐 Token from response:', response.data.data?.token);

    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      console.log('✅ Token stored in localStorage');
      console.log('✅ Token value:', localStorage.getItem('token'));
    } else {
      console.error('❌ No token in signup response!');
    }

    return response.data;
  },

  // Login with email and password
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    console.log('🔐 Login Response:', response.data);
    console.log('🔐 Token from response:', response.data.data?.token);

    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      console.log('✅ Token stored in localStorage');
      console.log('✅ Token value:', localStorage.getItem('token'));
    } else {
      console.error('❌ No token in login response!');
    }

    return response.data;
  },

  // Logout
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (name, avatar) => {
    const response = await api.put('/auth/profile', {
      name,
      avatar,
    });
    return response.data;
  },

  // Google OAuth - Initiate
  googleLogin: () => {
    window.location.href = `${BASE_URL}/api/v1/auth/google`;
  },

  // GitHub OAuth - Initiate
  githubLogin: () => {
    window.location.href = `${BASE_URL}/api/v1/auth/github`;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Forgot Password - Request reset code
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  // Verify reset code
  verifyResetCode: async (email, code) => {
    const response = await api.post('/auth/verify-reset-code', {
      email,
      code,
    });
    return response.data;
  },

  // Reset password with code
  resetPassword: async (email, code, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      email,
      code,
      newPassword,
    });
    return response.data;
  },
};

export default authService;

