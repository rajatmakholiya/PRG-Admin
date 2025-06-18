// src/api/simulateApi.ts
"use client"

import { Order } from "@/types";


interface LoginResult {
  success: boolean;
  role?: 'restaurant' | 'admin';
}

export const simulateLoginApi = (username: string, password: string): Promise<LoginResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (username === 'restaurant' && password === 'password123') {
        resolve({ success: true, role: 'restaurant' });
      } else if (username === 'Admin' && password === 'admin123') { // New admin credentials
        resolve({ success: true, role: 'admin' });
      } else {
        resolve({ success: false });
      }
    }, 1000);
  });
};

export const simulateFetchOrdersApi = (): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: 'ORD001',
          items: [{ name: 'Margherita Pizza', quantity: 2 }, { name: 'Coke', quantity: 3 }],
          address: '123 Main St, Anytown',
          deliveryTime: 'Today, 6:00 PM - 6:30 PM',
          status: 'pending',
          customerName: 'Alice Smith',
        },
        {
          id: 'ORD002',
          items: [{ name: 'Chicken Biryani', quantity: 1 }, { name: 'Naan', quantity: 2 }],
          address: '456 Oak Ave, Anytown',
          deliveryTime: 'Today, 7:00 PM - 7:30 PM',
          status: 'preparing',
          customerName: 'Bob Johnson',
        },
        {
          id: 'ORD003',
          items: [{ name: 'Vegetable Lasagna', quantity: 1 }],
          address: '789 Pine Ln, Anytown',
          deliveryTime: 'Today, 5:30 PM - 6:00 PM',
          status: 'ready',
          customerName: 'Charlie Brown',
        },
        {
          id: 'ORD004',
          items: [{ name: 'Sushi Platter', quantity: 1 }, { name: 'Miso Soup', quantity: 2 }],
          address: '101 Cedar Rd, Anytown',
          deliveryTime: 'Today, 8:00 PM - 8:30 PM',
          status: 'pending',
          customerName: 'Diana Prince',
        },
        {
          id: 'ORD005',
          items: [{ name: 'Burger Combo', quantity: 2 }, { name: 'Fries (Large)', quantity: 2 }],
          address: '222 Birch Way, Anytown',
          deliveryTime: 'Today, 9:00 PM - 9:30 PM',
          status: 'pending',
          customerName: 'Clark Kent',
        },
      ];
      resolve(mockOrders);
    }, 1500);
  });
};