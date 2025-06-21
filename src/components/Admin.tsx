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
    <div className="flex flex-col h-screen bg-gray-50"> {/* Use h-screen here */}
      <nav className="p-4 shadow-md flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#ff5757]">Admin Panel</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded-md text-white font-medium ${currentPage === 'dashboard' ? 'ring-2 ring-red-600' : 'hover:ring-2 hover:ring-red-400'}`}
            >
              <span style={{ color: '#ff5757' }}>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage('manageRestaurant')}
              className={`px-4 py-2 rounded-md text-white font-medium ${currentPage === 'manageRestaurant' ? 'ring-2 ring-red-600' : 'hover:ring-2 hover:ring-red-400'}`}
            >
              <span style={{ color: '#ff5757' }}>Manage Restaurant</span>
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:bg-red-800 transition duration-150 ease-in-out"
            >
              Logout
            </button>
            </div>
        </div>
      </nav>

      {/* This container should fill the rest of the screen and not scroll */}
      <div className="container mx-auto flex-1 flex flex-col overflow-y-auto"> {/* Use flex-1 and min-h-0 */}
        {currentPage === 'dashboard' && <AdminDashboard />}
        {currentPage === 'manageRestaurant' && <ManageRestaurant />}
      </div>
    </div>
  );
};

export default AdminModule;