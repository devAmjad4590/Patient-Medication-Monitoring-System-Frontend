import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuth } from './api/authAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Checking authentication status...');
      
      const userData = await checkAuth();
      
      if (userData && userData._id) {
        console.log('✅ User is authenticated:', userData.name);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('❌ User is not authenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('❌ Authentication check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData) => {
    console.log('✅ User logged in:', userData.name);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log('🚪 User logged out');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};