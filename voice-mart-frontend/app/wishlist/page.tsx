'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

export default function WishlistPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchWishlist();
    }
  }, [isLoaded, user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const wishlistResponse = await api.getWishlist(token);
      if (wishlistResponse.success && wishlistResponse.data) {
        const wishlistData = wishlistResponse.data as any;
        const productIds = wishlistData.productIds || [];

        // Fetch product details for each ID
        const products = [];
        for (const productId of productIds) {
          try {
            const productResponse = await api.getProduct(productId);
            if (productResponse.success && productResponse.data) {
              products.push(productResponse.data);
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
          }
        }

        setWishlistItems(products);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      await api.removeFromWishlist(productId, token);
      // Refresh wishlist
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">Save items you love for later</p>
        </div>

        {/* Wishlist Count */}
        {wishlistItems.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-card inline-block">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              <span className="font-semibold">{wishlistItems.length} items in wishlist</span>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 rounded-2xl bg-accent mb-4">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">Save items you love by clicking the heart icon</p>
            <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item: any) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-accent">
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/400'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-all shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-2">{item.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-4">₹{item.price.toLocaleString()}</p>

                  {/* Actions */}
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={item.stock === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
