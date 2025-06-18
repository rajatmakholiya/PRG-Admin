// src/components/ManageRestaurant.tsx
"use client"

import React, { useEffect, useState } from 'react';

// It's good practice to define or import the type for your data.
// You can import IMenuItem from '@/models/MenuItem' if your setup allows sharing types
// between frontend and backend easily. For simplicity here, I'll redefine a client-side version.
interface MenuItem {
  _id: string; // MongoDB typically adds _id
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  createdAt: string; // Dates will likely be strings after JSON serialization
  updatedAt: string;
}

const ManageRestaurant: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the "Add Item" modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newItemImageFile, setNewItemImageFile] = useState<File | null>(null);
  const [newItemImagePreview, setNewItemImagePreview] = useState<string | null>(null);


  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/menu'); // Your API endpoint

        if (!response.ok) {
          // Read the body as text first, regardless of content type
          const errorText = await response.text();
          let errorResponseMessage = `HTTP error! status: ${response.status}. Response: ${errorText.substring(0,150)}...`;
          try {
            // Now, try to parse the text as JSON
            const errorData = JSON.parse(errorText);
            errorResponseMessage = errorData.error || errorResponseMessage;
          } catch (err) {
            // Parsing as JSON failed, use the text content or a generic message
            // errorResponseMessage is already set with the text content
            console.error("Failed to parse error response as JSON:", err);
          }
          throw new Error(errorResponseMessage);
        }

        // For a successful response (response.ok is true), try to parse as JSON.
        // Read as text first to preserve the body in case JSON.parse fails.
        const textResponse = await response.text();
        try {
          const data = JSON.parse(textResponse);
          if (data.success) {
            setMenuItems(data.data);
          } else {
            throw new Error(data.error || 'API request was successful but operation failed');
          }
        } catch (jsonParseError) {
          // This block will be hit if textResponse is HTML, causing JSON.parse to fail.
          console.error("Failed to parse successful response as JSON:", jsonParseError);
          throw new Error(`Received an unexpected non-JSON response from the server. Content starts with: ${textResponse.substring(0, 150)}...`);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error("Failed to fetch menu items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []); // Empty dependency array means this runs once on mount

  const openModal = () => {
    setNewItemName('');
    setNewItemDescription('');
    setNewItemPrice('');
    setNewItemImageFile(null);
    setNewItemImagePreview(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewItemImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewItemImageFile(null);
      setNewItemImagePreview(null);
    }
  };
  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    const priceNumber = parseFloat(newItemPrice);
    if (isNaN(priceNumber) || priceNumber < 0) {
      setModalError('Price must be a valid non-negative number.');
      setIsSubmitting(false);
      return;
    }

    if (!newItemImageFile) {
      setModalError('Image is required.');
      setIsSubmitting(false);
      return;
    }

    let imageBase64Data: string | undefined = undefined;
    if (newItemImageFile) {
      imageBase64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(newItemImageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    try {
      interface NewMenuItemPayload {
        name: string;
        description: string;
        price: number;
        imageBase64Data?: string;
      }

      const payload: NewMenuItemPayload = {
        name: newItemName,
        description: newItemDescription,
        price: priceNumber,
      };
      if (imageBase64Data) {
        payload.imageBase64Data = imageBase64Data;
      }

      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      setMenuItems(prevItems => [result.data, ...prevItems]); // Add new item to the top
      closeModal();
    } catch (err) {
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError('An unknown error occurred while adding the item.');
      }
      console.error("Failed to add menu item:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading menu items...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900">Manage Menu Items</h1>
        <button
          className="hover:ring-2 hover:ring-red-400 text-[#ff5757] font-bold py-2 px-4 rounded-md"
          onClick={openModal}
        >
          Add New Item
        </button>
      </div>

      {menuItems.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          No menu items found. Click &quot;Add New Item&quot; to get started!
        </div>
      ) : (
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item._id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-md mb-4" />}
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">{item.name}</h2>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-lg font-bold text-green-600 mb-3">Price: ${item.price.toFixed(2)}</p>
              <div className="text-xs text-gray-400">
                <p>Added: {new Date(item.createdAt).toLocaleDateString()} | Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
              </div>
              {/* Add Edit/Delete buttons here if needed */}
            </li>
          ))}
        </ul>
      )}

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Menu Item</h2>
            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="itemName"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="mt-1 text-gray-900 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="itemDescription"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  rows={3}
                  className="mt-1 text-gray-900 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  id="itemPrice"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="mt-1 text-gray-900 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="itemImageFile" className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  id="itemImageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  required // Make the file input required
                  className="mt-1 block w-full px-3 py-2 border text-gray-300 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {newItemImagePreview && (
                  <div className="mt-2">
                    <img src={newItemImagePreview} alt="Preview" className="h-32 w-auto rounded-md object-cover"/>
                  </div>
                )}
              </div>

              {modalError && <p className="text-red-500 text-sm">{modalError}</p>}

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="hover:text-green-700 text-green-500 font-bold py-2 px-6 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="ml-4 hover:text-gray-900 text-gray-600 font-bold py-2 px-6 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRestaurant;