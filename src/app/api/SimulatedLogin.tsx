"use client"

interface LoginResult {
  success: boolean;
  role?: 'restaurant' | 'admin';
}

export const simulateLoginApi = (username: string, password: string): Promise<LoginResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (username === 'restaurant' && password === 'password123') {
        resolve({ success: true, role: 'restaurant' });
      } else if (username === 'Admin' && password === 'admin123') {
        resolve({ success: true, role: 'admin' });
      } else {
        resolve({ success: false });
      }
    }, 1000);
  });
};
