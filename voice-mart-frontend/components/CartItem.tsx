'use client';

import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Trans } from '@/app/context/Translator';

interface CartItemProps {
  item: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrement = async () => {
    await updateQuantity(item.productId, item.quantity + 1);
  };

  const handleDecrement = async () => {
    if (item.quantity > 1) {
      await updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleRemove = async () => {
    await removeItem(item.productId);
  };

  return (
    <div className="flex gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary/30 transition-all">
      {/* Image */}
      <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-accent">
        <img
          src={item.productImage || 'https://via.placeholder.com/150'}
          alt={item.productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg mb-1 truncate">{item.productName}</h3>
        <p className="text-primary font-bold text-xl">₹{item.price.toLocaleString()}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-2 border-2 border-border rounded-lg p-1">
          <button
            onClick={handleDecrement}
            className="p-1.5 hover:bg-accent rounded transition-colors"
            disabled={item.quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <button
            onClick={handleIncrement}
            className="p-1.5 hover:bg-accent rounded transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleRemove}
          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="shrink-0 text-right">
        <p className="text-sm text-muted-foreground mb-1"><Trans>Subtotal</Trans></p>
        <p className="font-bold text-xl">₹{(item.price * item.quantity).toLocaleString()}</p>
      </div>
    </div>
  );
}
