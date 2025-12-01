'use client';

import { useUser } from '@clerk/nextjs';
import { useCart } from '@/contexts/CartContext';
import { redirect } from 'next/navigation';
import CartItem from '@/components/CartItem';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Trans } from '@/app/context/Translator';

export default function CartPage() {
  const { user, isLoaded } = useUser();
  const { items, totalItems, totalPrice, loading } = useCart();

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

  const deliveryFee = totalPrice > 0 ? 50 : 0;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2"><Trans>Shopping Cart</Trans></h1>
          <p className="text-muted-foreground">{totalItems} <Trans>item(s) in your cart</Trans></p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-flex p-6 rounded-2xl bg-accent mb-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2"><Trans>Your cart is empty</Trans></h3>
            <p className="text-muted-foreground mb-6"><Trans>Add some products to get started</Trans></p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
            >
              <Trans>Browse Products</Trans>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl border-2 border-border bg-card">
                <h2 className="text-xl font-bold mb-6"><Trans>Order Summary</Trans></h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span><Trans>Subtotal</Trans></span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span><Trans>Delivery Fee</Trans></span>
                    <span>{deliveryFee === 0 ? <Trans>FREE</Trans> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between text-lg font-bold">
                    <span><Trans>Total</Trans></span>
                    <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all mb-3">
                  <Trans>Proceed to Checkout</Trans>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <Link
                  href="/shop"
                  className="block text-center text-sm text-primary hover:underline"
                >
                  <Trans>Continue Shopping</Trans>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
