"use client"

import AdminModule from '@/components/Admin';
import LoginPage from '@/components/Login';
import OrdersPage from '@/components/Orders';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import React from 'react';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isLoggedIn, userRole } = useAuth();

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  if (userRole === 'admin') {
    return <AdminModule />;
  }

  if (userRole === 'restaurant') {
    return <OrdersPage />;
  }

  return <LoginPage />;
};

export default App;