// src/components/MenuItemSkeleton.tsx
import React from 'react';

const MenuItemSkeleton: React.FC = () => {
  return (
    <li className="bg-white shadow-md rounded-lg p-6 border border-gray-200 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div> {/* Name Placeholder */}
      <div className="h-4 bg-gray-300 rounded w-full mb-1"></div> {/* Description Line 1 Placeholder */}
      <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div> {/* Description Line 2 Placeholder */}
      <div className="h-5 bg-gray-300 rounded w-1/4 mb-3"></div> {/* Price Placeholder */}
      
    </li>
  );
};

export default MenuItemSkeleton;