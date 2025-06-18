// src/components/AdminDashboard.tsx
"use client"

import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg text-gray-700">Welcome to the Admin Dashboard!</p>
        <p className="mt-4 text-gray-600">Here you can find an overview of your restaurant operations and key metrics. (Content to be added later)</p>
      </div>
    </div>
  );
};

export default AdminDashboard;