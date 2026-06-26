import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token') || localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Verify and fetch profile on load if token exists
  useEffect(() => {
    const checkUserSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get('/auth/profile');
        if (res.data.success) {
          const userData = res.data.user;
          
          // Strict enforcement: if admin/manager token is in localStorage (e.g. from a previous session before this feature), migrate it out.
          if (userData.role === 'admin' || userData.role === 'manager') {
            const localToken = localStorage.getItem('token');
            if (localToken) {
              sessionStorage.setItem('token', localToken);
              localStorage.removeItem('token');
            }
          }
          
          setUser(userData);
        } else {
          // Token is invalid/expired
          handleLogoutCleanup();
        }
      } catch (err) {
        console.error('Session verification error:', err);
        handleLogoutCleanup();
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, [token]);

  const handleLogoutCleanup = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Synchronize authentication token updates across multiple tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        const newToken = e.newValue;
        if (!newToken) {
          // Token was deleted (logout) in another tab
          setToken(null);
          setUser(null);
        } else {
          // Token was changed/updated (login as different user) in another tab
          setToken(newToken);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await API.post('/auth/login', { email, password, rememberMe });
      if (res.data.success) {
        if (res.data.requireOtp) {
          return { success: true, requireOtp: true, email: res.data.email };
        }

        const { token: userToken, user: userData } = res.data;
        if (userData.role === 'admin' || userData.role === 'manager') {
          sessionStorage.setItem('token', userToken);
        } else {
          localStorage.setItem('token', userToken);
        }
        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      console.error('Login request failed:', err);
      throw err.response?.data?.message || err.message || 'Invalid username or password';
    }
  };

  const register = async (firstName, lastName, email, password, phone) => {
    try {
      const res = await API.post('/auth/register', { firstName, lastName, email, password, phone });
      if (res.data.success) {
        return { success: true, email: res.data.email, message: res.data.message };
      }
    } catch (err) {
      console.error('Registration request failed:', err);
      throw err.response?.data?.message || err.message || 'Registration failed';
    }
  };

  const verifyLoginOtp = async (email, otp) => {
    try {
      const res = await API.post('/auth/verify-login-otp', { email, otp });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        sessionStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      console.error('Verify login OTP request failed:', err);
      throw err.response?.data?.message || err.message || 'Invalid OTP';
    }
  };

  const verifyRegistrationOtp = async (email, otp) => {
    try {
      const res = await API.post('/auth/verify-registration', { email, otp });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      throw err.response?.data?.message || err.message || 'Verification failed';
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      handleLogoutCleanup();
    }
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyRegistrationOtp, verifyLoginOtp, logout, hasRole, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
