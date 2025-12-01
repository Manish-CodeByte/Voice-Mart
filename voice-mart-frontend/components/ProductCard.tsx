'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Star, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Trans } from '@/app/context/Translator';
import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    imageUrl?: string;
    category: string;
    stock: number;
    rating?: number;
    reviews?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const itemQuantity = getItemQuantity(product.id);

  useEffect(() => {
    checkWishlist();
  }, [product.id]);

  const checkWishlist = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.getWishlist(token);
      if (response.success && response.data) {
        const wishlistData = response.data as any;
        setIsInWishlist(wishlistData.productIds?.includes(product.id) || false);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setLoading(true);
    try {
      await addToCart(product.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    updateQuantity(product.id, itemQuantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (itemQuantity > 0) {
      updateQuantity(product.id, itemQuantity - 1);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Please sign in to add to wishlist');
        return;
      }

      if (isInWishlist) {
        await api.removeFromWishlist(product.id, token);
        setIsInWishlist(false);
      } else {
        await api.addToWishlist(product.id, token);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <Link href={`/shop/${product.id}`}>
      <div className="group relative rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all overflow-hidden cursor-pointer">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-accent">
          <img
            src={product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm">
                <Trans>Out of Stock</Trans>
              </span>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all z-10 ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-background/80 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Cart Badge */}
          {itemQuantity > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg">
              {itemQuantity} <Trans>in cart</Trans>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          {/* Rating */}
          {product.rating && product.reviews && product.reviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted'
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({product.reviews})
              </span>
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-bold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-2xl font-bold text-primary mb-3">
            ₹{product.price.toLocaleString()}
          </p>

          {/* Cart Controls */}
          {itemQuantity > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrement}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/80 font-semibold transition-all"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2.5 font-bold text-lg">{itemQuantity}</span>
              <button
                onClick={handleIncrement}
                disabled={itemQuantity >= product.stock}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:opacity-50 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
              {loading ? <Trans>Adding...</Trans> : <Trans>Add to Cart</Trans>}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
