'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!isLoaded || !user) return;
    
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.getCart(token);
      if (response.success && response.data) {
        const data = response.data as any;
        setItems(data.items || []);
        setTotalItems(data.totalItems || 0);
        setTotalPrice(data.totalPrice || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user, isLoaded]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await api.addToCart(productId, quantity, token);
      if (response.success) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await api.updateCartItem(productId, quantity, token);
      if (response.success) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await api.removeFromCart(productId, token);
      if (response.success) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await api.clearCart(token);
      if (response.success) {
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
