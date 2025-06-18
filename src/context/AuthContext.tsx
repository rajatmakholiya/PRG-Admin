// src/context/AuthContext.tsx
"use client"

import { simulateLoginApi } from '@/app/api/SimulateApi';
import React, { createContext, useContext, useState } from 'react';

type UserRole = 'restaurant' | 'admin' | null;

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: UserRole;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    const result = await simulateLoginApi(username, password);
    if (result.success) {
      setIsLoggedIn(true);
      setUserRole(result.role || null);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
    return result.success;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

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