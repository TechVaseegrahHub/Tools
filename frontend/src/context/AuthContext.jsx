import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create the context
const AuthContext = createContext();

// In development: Vite proxy handles /api/* → localhost:5001
// In production: set VITE_API_URL=https://your-backend.com in your deployment env vars
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/api/auth/`;

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef(null);

  // Global axios interceptor: auto-logout on any 401 response
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          if (logoutRef.current) logoutRef.current();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Get user from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      axios.get(API_URL + 'me')
        .then(res => {
          setUser(res.data);
        })
        .catch((err) => {
          console.error("AuthContext Load: /me failed", err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('--- Login Debug ---');
      console.log('API URL:', API_URL + 'login');
      const res = await axios.post(API_URL + 'login', { email, password });
      console.log('Full API Response:', res);

      // Store user and token
      setUser(res.data);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      toast.success('Login successful!');
      return res.data; // Success
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      // Return the error message from the API
      throw new Error(errorMessage);
    }
  };

  // Google OAuth login/register
  const loginWithGoogle = async (idToken) => {
    try {
      const res = await axios.post(API_URL + 'google', { idToken });

      // New user — needs to create an org; return data to caller without setting user
      if (res.data.newUser) {
        return res.data;
      }

      // Existing user — store token and set user state
      setUser(res.data);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      toast.success(`Welcome back, ${res.data.name}!`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Google sign-in failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Google register org (for new Google users who need to create an org)
  const googleRegisterOrg = async (idToken, orgName, adminPassword) => {
    try {
      const res = await axios.post(API_URL + 'google-register-org', { idToken, orgName, adminPassword });

      setUser(res.data);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      toast.success(`Welcome to ToolRoom, ${res.data.org?.name}!`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.info('You have been logged out');
  };

  // Keep logoutRef in sync so the interceptor always calls the latest logout
  logoutRef.current = logout;

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, googleRegisterOrg, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};