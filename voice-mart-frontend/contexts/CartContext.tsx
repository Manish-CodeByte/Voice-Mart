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
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  getItemQuantity: (productId: string) => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'voice_mart_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [items]);

  // Sync with backend when user logs in
  useEffect(() => {
    if (isLoaded && user) {
      syncCart();
    }
  }, [user, isLoaded]);

  const syncCart = async () => {
    if (!user) return;
    
    try {
      const token = await getToken();
      if (!token) return;

      // Get backend cart
      const response = await api.getCart(token);
      if (response.success && response.data) {
        const backendCart = response.data as any;
        
        // Merge with local cart (local takes precedence)
        if (items.length > 0 && backendCart.items.length === 0) {
          // Upload local cart to backend
          for (const item of items) {
            await api.addToCart(item.productId, item.quantity, token);
          }
        } else if (backendCart.items.length > 0) {
          // Use backend cart
          setItems(backendCart.items);
        }
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  const refreshCart = async () => {
    // Just recalculate from local state
    return;
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = async (productId: string, quantity: number = 1) => {
    setLoading(true);
    try {
      // Fetch product details
      const response = await api.getProduct(productId);
      if (!response.success || !response.data) {
        throw new Error('Product not found');
      }

      const product = response.data as any;

      setItems(prevItems => {
        const existingItem = prevItems.find(item => item.productId === productId);
        
        if (existingItem) {
          return prevItems.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [
            ...prevItems,
            {
              productId,
              productName: product.name,
              productImage: product.images?.[0] || '',
              quantity,
              price: product.price,
            },
          ];
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const clearCart = async () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);

    // Also clear backend cart
    try {
      const token = await getToken();
      if (token) {
        await api.clearCart(token);
      }
    } catch (error) {
      console.error('Error clearing backend cart:', error);
    }
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find(i => i.productId === productId);
    return item?.quantity || 0;
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
        syncCart,
        getItemQuantity,
        isCartOpen,
        openCart,
        closeCart,
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
