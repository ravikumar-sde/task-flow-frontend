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

    // Note: Token is not stored here anymore, user needs to verify OTP first
    return response.data;
  },

  // Verify email with verification code
  verifyEmail: async (email, code) => {
    const response = await api.post('/auth/verify-email', {
      email,
      code,
    });

    // Store tokens after successful email verification
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }

    return response.data;
  },

  // Resend verification code
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', {
      email,
    });

    return response.data;
  },

  // Login with email and password
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
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
};

export default authService;

