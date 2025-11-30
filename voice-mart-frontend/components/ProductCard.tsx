'use client';

import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    rating?: number;
    reviews?: number;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addToCart(product.id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-accent">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all shadow-lg">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="text-primary">★ {product.rating.toFixed(1)}</span>
            {product.reviews && <span>({product.reviews} reviews)</span>}
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</p>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
          >
            <ShoppingCart className="h-4 w-4" />
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
