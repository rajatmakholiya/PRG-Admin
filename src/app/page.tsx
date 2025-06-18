// src/app/page.tsx

"use client"

import AdminModule from '@/components/Admin';
import LoginPage from '@/components/Login';
import OrdersPage from '@/components/Orders';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import React from 'react';

// This is the main component that Next.js will render for your root route.
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

// This internal component decides which page to show based on authentication state and user role.
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

  // Fallback if logged in but role is somehow null/undefined (shouldn't happen with current logic)
  return <LoginPage />;
};

export default App;