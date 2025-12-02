'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@clerk/nextjs';
import { ShoppingCart, Heart, Star, Check, Truck, Shield, ArrowLeft } from 'lucide-react';
import ProductReviews from '@/components/ProductReviews';
import { toast } from 'sonner';
import { Trans } from '@/app/context/Translator';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, getItemQuantity, updateQuantity, openCart } = useCart();
  const { getToken } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
      checkWishlist();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.getProduct(params.id as string);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.getWishlist(token);
      if (response.success && response.data) {
        const wishlistData = response.data as any;
        setIsInWishlist(wishlistData.productIds?.includes(params.id) || false);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(params.id as string, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Please sign in to add to wishlist');
        return;
      }

      if (isInWishlist) {
        await api.removeFromWishlist(params.id as string, token);
        setIsInWishlist(false);
      } else {
        await api.addToWishlist(params.id as string, token);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h1 className="text-4xl font-bold mb-4"><Trans>Product Not Found</Trans></h1>
        <p className="text-muted-foreground mb-6"><Trans>The product you're looking for doesn't exist.</Trans></p>
        <button
          onClick={() => router.push('/shop')}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          <Trans>Back to Shop</Trans>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <Trans>Back</Trans>
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-accent mb-4">
              <img
                src={product.images?.[selectedImage] || (product as any).imageUrl || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-3">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating || 0} ({product.reviews || 0} <Trans>reviews</Trans>)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-5xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                {product.category && (
                  <span className="px-3 py-1 rounded-full bg-accent text-sm font-semibold">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-600 mb-6">
                  <Check className="h-5 w-5" />
                  <span className="font-semibold"><Trans>In Stock</Trans> ({product.stock} <Trans>available</Trans>)</span>
                </div>
              ) : (
                <div className="text-destructive font-semibold mb-6"><Trans>Out of Stock</Trans></div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3"><Trans>Description</Trans></h3>
              <p className="text-muted-foreground leading-relaxed"><Trans>{product.description}</Trans></p>
            </div>

            {/* Dynamic Cart Actions */}
            {getItemQuantity(params.id as string) > 0 ? (
              <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="flex items-center gap-2 text-primary font-bold mb-4">
                  <Check className="h-5 w-5" />
                  <Trans>Added to Cart</Trans>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-background rounded-xl border border-border p-1">
                    <button
                      onClick={() => updateQuantity(params.id as string, Math.max(0, getItemQuantity(params.id as string) - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent font-bold text-lg transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-xl">{getItemQuantity(params.id as string)}</span>
                    <button
                      onClick={() => updateQuantity(params.id as string, Math.min(product.stock, getItemQuantity(params.id as string) + 1))}
                      disabled={getItemQuantity(params.id as string) >= product.stock}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={openCart}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                  >
                    <Trans>Go to Cart</Trans>
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isInWishlist
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-border hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3"><Trans>Quantity</Trans></label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg border-2 border-border hover:border-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 rounded-lg border-2 border-border hover:border-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {addingToCart ? <Trans>Adding...</Trans> : <Trans>Add to Cart</Trans>}
                  </button>
                  
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isInWishlist
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-border hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </>
            )}

            {/* Features */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent">
                <Truck className="h-6 w-6 text-primary" />
                <div>
                  <div className="font-semibold"><Trans>Free Delivery</Trans></div>
                  <div className="text-sm text-muted-foreground"><Trans>On orders over ₹500</Trans></div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <div className="font-semibold"><Trans>Secure Payment</Trans></div>
                  <div className="text-sm text-muted-foreground"><Trans>100% secure transactions</Trans></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={params.id as string} />
      </div>
    </div>
  );
}
