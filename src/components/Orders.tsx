"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { IOrder, IOrderItem } from '@/models/Order';
import moment from "moment";
import { io, Socket } from 'socket.io-client';

const OrdersPage: React.FC = () => {
    const { logout } = useAuth();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [statusFilter, setStatusFilter] = useState<'all' | IOrder['status']>('all');
    const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<'all' | IOrder['deliveryType']>('all');


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/orders');
                const result = await response.json();

                if (result.success) {
                    setOrders(result.data);
                } else {
                    throw new Error(result.error || 'Failed to fetch orders.');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);


    useEffect(() => {
        const socket: Socket = io();
        socket.on('connect', () => {});
        socket.on('new-order', (newOrder: IOrder) => {
            setOrders((prevOrders) => [newOrder, ...prevOrders]);
        });
        socket.on('disconnect', () => {});
        return () => {
            socket.disconnect();
        };
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const statusMatch = statusFilter === 'all' || order.status === statusFilter;
            const deliveryTypeMatch = deliveryTypeFilter === 'all' || order.deliveryType === deliveryTypeFilter;
            return statusMatch && deliveryTypeMatch;
        });
    }, [orders, statusFilter, deliveryTypeFilter]);


    const handleStatusChange = (orderId: string, newStatus: IOrder['status']) => {
        // @ts-expect-error: Ignore type error due to possible Mongoose document properties
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const getStatusColor = (status: IOrder['status']) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-300 text-yellow-700';
            case 'Confirmed': return 'bg-blue-200 text-blue-800';
            case 'Out for Delivery': return 'bg-green-200 text-green-700';
            case 'Delivered': return 'bg-green-500 text-green-800';
            case 'Cancelled': return 'bg-red-300 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 align-middle">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    Current Orders
                </h1>
                <div className="flex items-end gap-4 text-gray-600">
                    <div className='flex flex-row gap-2 items-center'>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            id="status-filter"
                            name="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | IOrder['status'])}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="all">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className='flex flex-row gap-2 items-center w-auto'>
                        <label htmlFor="delivery-type-filter " className="block text-sm font-medium text-gray-700">
                            Delivery
                        </label>
                        <select
                            id="delivery-type-filter"
                            name="delivery-type-filter"
                            value={deliveryTypeFilter}
                            onChange={(e) => setDeliveryTypeFilter(e.target.value as 'all' | IOrder['deliveryType'])}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="all">All</option>
                            <option value="Immediate">Immediate</option>
                            <option value="Scheduled">Scheduled</option>
                        </select>
                    </div>
                    <button
                        onClick={logout}
                        className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {loading && <div className="text-center text-xl text-gray-600">Loading orders...</div>}
            {error && <div className="text-center text-red-500">Error: {error}</div>}

            {!loading && !error && (
                <>
                    {filteredOrders.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredOrders.map((order) => (
                                <div key={order._id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Order #{order._id.slice(-6)}</h3>
                                            <p className="text-gray-700 font-semibold">Customer: {order.deliveryAddress.fullName}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-gray-800 font-bold mb-1">Items:</p>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {order.items.map((item: IOrderItem, index: number) => (
                                                <li key={index} className="flex justify-between">
                                                    <span>{item.name} <span className="font-semibold">x{item.quantity}</span></span>
                                                    <span>鈧�{(item.price * item.quantity).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="border-t mt-2 pt-2 flex justify-between font-bold text-gray-800">
                                            <span>Total</span>
                                            <span>鈧�{order.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600 mb-4">
                                        <p className="font-bold text-gray-800">Delivery To:</p>
                                        <p>{order.deliveryAddress.streetAddress}, {order.deliveryAddress.city}</p>
                                        <p>{order.deliveryAddress.state} - {order.deliveryAddress.postalCode}</p>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-200 text-black">
                                        <div className="flex justify-between items-center mb-2 text-sm">
                                            <span className='font-semibold'>Payment:</span>
                                            <span>{order.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-3 text-sm">
                                            <span className='font-semibold'>Delivery:</span>
                                            <span className='flex items-center'>
                                                <span className='ml-1'>{order.deliveryType === 'Immediate' ? `鈿mmediate` : ` ${order.scheduledAt ? `馃晵 ${moment(order.scheduledAt).format('MMM D, h:mm A')}` : ' '}`}</span>
                                            </span>
                                        </div>
                                        <select
                                            id={`status-select-${order._id}`}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value as IOrder['status'])}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Out for Delivery">Out for Delivery</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-600 text-lg">
                            {orders.length > 0 ? 'No orders match the current filters.' : 'No new orders at the moment.'}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrdersPage;