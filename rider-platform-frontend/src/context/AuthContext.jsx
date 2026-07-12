// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 
import { BASE_URL } from '../constants/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wrapped in useCallback to prevent memory recreation
  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Wrapped in useCallback to prevent memory recreation
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // BULLETPROOF REFRESH ENGINE: Wrapped in useCallback to stop infinite loops
  const refreshUser = useCallback(async () => {
    try {
      let token = localStorage.getItem('token');
      
      if (!token) {
        console.warn("Refresh aborted: No token found in LocalStorage.");
        return;
      }

      // Strip any accidental quotes from the token that would break backend verification
      token = token.replace(/"/g, '');

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Force React to update immediately
      setUser(res.data);
      
      // Update LocalStorage so it survives the next page reload
      localStorage.setItem('user', JSON.stringify(res.data));
      
    } catch (error) {
      console.error("Failed to refresh user stats:", error.response?.data || error.message);
    }
  }, []);

  // Initial Load & Window Focus Listener
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse user from local storage", err);
      }
    }
    setLoading(false);

    // Tab Focus Listener: Fetch fresh data when user returns to the tab
    const handleTabFocus = () => {
      if (localStorage.getItem('token')) {
        refreshUser();
      }
    };

    window.addEventListener('focus', handleTabFocus);

    // Cleanup listener on unmount to prevent memory leaks
    return () => {
      window.removeEventListener('focus', handleTabFocus);
    };
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};