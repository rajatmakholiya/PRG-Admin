// src/components/ManageRestaurant.tsx
"use client"

import React from 'react';

const ManageRestaurant: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Manage Restaurant</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg text-gray-700">This page allows you to manage restaurant settings, menu items, and more. (Content to be added later)</p>
        <p className="mt-4 text-gray-600">e.g., Update menu, change operating hours, manage staff accounts.</p>
      </div>
    </div>
  );
};

export default ManageRestaurant;