// src/components/OrdersPage.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path
import { simulateFetchOrdersApi } from '@/api/SimulateApi';
import { Order } from '@/types';

const OrdersPage: React.FC = () => {
  const { logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await simulateFetchOrdersApi();
        setOrders(data);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Current Orders
        </h1>
        <button
          onClick={logout}
          className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
        >
          Logout
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-700"></div>
          <p className="ml-4 text-xl text-gray-600">Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-10 text-gray-600 text-lg">No new orders at the moment.</div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">Order #{order.id}</h3>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <p className="text-gray-700 text-lg font-semibold mb-2">Customer: {order.customerName}</p>

                <div className="mb-4">
                  <p className="text-gray-600 font-medium mb-1">Items:</p>
                  <ul className="list-disc list-inside text-gray-600">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between text-base">
                        <span>{item.name}</span>
                        <span className="font-semibold">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Address:</span> {order.address}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Delivery Time:</span> {order.deliveryTime}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <label htmlFor={`status-select-${order.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Update Status:
                </label>
                <select
                  id={`status-select-${order.id}`}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={order.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleStatusChange(order.id, e.target.value as Order['status'])
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
