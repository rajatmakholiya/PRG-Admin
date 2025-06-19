// src/context/AuthContext.tsx
"use client"

import { simulateLoginApi } from '@/app/api/SimulateApi'; // Assuming SimulateApi.tsx is in app/api
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type UserRole = 'restaurant' | 'admin' | null;

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: UserRole;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_LOGGED_IN = 'nextAuthLoggedIn';
const STORAGE_KEY_USER_ROLE = 'nextAuthUserRole';
const STORAGE_KEY_EXPIRY_TIME = 'nextAuthExpiryTime';
const LOGIN_CACHE_DURATION_MS = 60 * 60 * 1000; // 60 minutes

const getInitialAuthState = (): { isLoggedIn: boolean; userRole: UserRole } => {
  if (typeof window === 'undefined') { // Prevent localStorage access during SSR/prerender
    return { isLoggedIn: false, userRole: null };
  }
  try {
    const storedIsLoggedIn = localStorage.getItem(STORAGE_KEY_LOGGED_IN);
    const storedUserRoleString = localStorage.getItem(STORAGE_KEY_USER_ROLE);
    const storedExpiryTime = localStorage.getItem(STORAGE_KEY_EXPIRY_TIME);

    if (storedIsLoggedIn === 'true' && storedUserRoleString && storedExpiryTime) {
      const expiryTime = parseInt(storedExpiryTime, 10);
      if (Date.now() < expiryTime) {
        const userRole = JSON.parse(storedUserRoleString) as UserRole;
        return { isLoggedIn: true, userRole };
      }
    }
  } catch (error) {
    console.error("Error reading auth state from localStorage", error);
  }

  localStorage.removeItem(STORAGE_KEY_LOGGED_IN);
  localStorage.removeItem(STORAGE_KEY_USER_ROLE);
  localStorage.removeItem(STORAGE_KEY_EXPIRY_TIME);
  return { isLoggedIn: false, userRole: null };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialAuthState = getInitialAuthState();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialAuthState.isLoggedIn);
  const [userRole, setUserRole] = useState<UserRole>(initialAuthState.userRole);

  const login = async (username: string, password: string): Promise<boolean> => {
    const result = await simulateLoginApi(username, password);
    if (result.success) {
      setIsLoggedIn(true);
      setUserRole(result.role || null);
      const expiryTime = Date.now() + LOGIN_CACHE_DURATION_MS;
      localStorage.setItem(STORAGE_KEY_LOGGED_IN, 'true');
      localStorage.setItem(STORAGE_KEY_USER_ROLE, JSON.stringify(result.role || null));
      localStorage.setItem(STORAGE_KEY_EXPIRY_TIME, expiryTime.toString());
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      localStorage.removeItem(STORAGE_KEY_LOGGED_IN);
      localStorage.removeItem(STORAGE_KEY_USER_ROLE);
      localStorage.removeItem(STORAGE_KEY_EXPIRY_TIME);
    }
    return result.success;
  };

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem(STORAGE_KEY_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEY_USER_ROLE);
    localStorage.removeItem(STORAGE_KEY_EXPIRY_TIME);
  }, []);

  useEffect(() => {
    const checkAuthStatus = () => {
      const storedExpiryTime = localStorage.getItem(STORAGE_KEY_EXPIRY_TIME);
      if (storedExpiryTime) {
        const expiryTime = parseInt(storedExpiryTime, 10);
        if (Date.now() >= expiryTime) {
          logout(); // Session expired
        }
      } else if (isLoggedIn) {
        // If app state is loggedIn but localStorage is missing expiry, treat as invalid
        logout();
      }
    };

    checkAuthStatus(); // Check on mount
    const intervalId = setInterval(checkAuthStatus, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [isLoggedIn, logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};