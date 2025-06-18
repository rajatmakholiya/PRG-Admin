// src/components/AdminModule.tsx
"use client"

import React, { useState } from 'react';
import ManageRestaurant from './ManageRestaurant';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from './Dashboard';

type AdminPage = 'dashboard' | 'manageRestaurant';

const AdminModule: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-700 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded-md text-white font-medium ${currentPage === 'dashboard' ? 'bg-indigo-900' : 'hover:bg-indigo-600'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('manageRestaurant')}
              className={`px-4 py-2 rounded-md text-white font-medium ${currentPage === 'manageRestaurant' ? 'bg-indigo-900' : 'hover:bg-indigo-600'}`}
            >
              Manage Restaurant
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto mt-4">
        {currentPage === 'dashboard' && <AdminDashboard />}
        {currentPage === 'manageRestaurant' && <ManageRestaurant />}
      </div>
    </div>
  );
};

export default AdminModule;