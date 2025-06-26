"use client"
import MenuItemSkeleton from './Loading/MenuItemSkeleton';

import React, { useEffect, useState } from 'react';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const ManageRestaurant: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newItemImageFile, setNewItemImageFile] = useState<File | null>(null);
  const [newItemImagePreview, setNewItemImagePreview] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);


  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/menu');

        if (!response.ok) {
          const errorText = await response.text();
          let errorResponseMessage = `HTTP error! status: ${response.status}. Response: ${errorText.substring(0,150)}...`;
          try {
            const errorData = JSON.parse(errorText);
            errorResponseMessage = errorData.error || errorResponseMessage;
          } catch (err) {
          }
          throw new Error(errorResponseMessage);
        }

        const textResponse = await response.text();
        try {
          const data = JSON.parse(textResponse);
          if (data.success) {
            setMenuItems(data.data);
          } else {
            throw new Error(data.error || 'API request was successful but operation failed');
          }
        } catch (jsonParseError) {
          throw new Error(`Received an unexpected non-JSON response from the server. Content starts with: ${textResponse.substring(0, 150)}...`);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

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

    if (!newItemImageFile) {
      setModalError('Image is required.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', newItemName);
    formData.append('description', newItemDescription);
    formData.append('price', newItemPrice);
    formData.append('imageFile', newItemImageFile);

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      setMenuItems(prevItems => [result.data, ...prevItems]);
      closeModal();
    } catch (err) {
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError('An unknown error occurred while adding the item.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    setDeletingItemId(itemId);
    setError(null);

    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      setMenuItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to delete item: ${err.message}`);
      } else {
        setError('An unknown error occurred while deleting the item.');
      }
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-8 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">Manage Menu Items</h1>
          <button
            className="hover:ring-2 hover:ring-red-400 text-[#ff5757] font-bold py-2 px-4 rounded-md"
            onClick={openModal}
          >
            Add New Item
          </button>
        </div>
      </div>

      <div className="px-8 pb-8 pt-2">
        {error && (
          <div className="text-center p-8 text-red-500 bg-red-100 border border-red-300 rounded-md">
            Error: {error}
          </div>
        )}

        {!error && isLoading && (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
            {[...Array(3)].map((_, index) => (
              <MenuItemSkeleton key={index} />
            ))}
          </ul>
        )}

        {!error && !isLoading && menuItems.length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
              No menu items found. Click &quot;Add New Item&quot; to get started!
            </div>
          )}

        {!error && !isLoading && menuItems.length > 0 && (
            <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
              {menuItems.map((item) => (
                <li key={item._id} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 flex flex-col">
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                      <div className="flex-grow">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-1">{item.name}</h2>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      </div>
                      <p className="text-lg font-bold text-green-600 md:text-xl whitespace-nowrap">Price: ₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
                    <p>Added: {new Date(item.createdAt).toLocaleDateString()} | Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
                  
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    disabled={deletingItemId === item._id}
                    className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-1 px-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed mt-2 sm:mt-0"
                  >
                    {deletingItemId === item._id ? 'Deleting...' : 'Delete'}
                  </button>
                  </div>
                </li>
              ))}
            </ul>
        )}
      </div>

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
                  required
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