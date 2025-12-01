'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CreditCard, Building2, Smartphone, Wallet, ArrowLeft, Check, MapPin, BookmarkCheck } from 'lucide-react';
import { api } from '@/lib/api';
import Breadcrumbs from '@/components/Breadcrumbs';
import { toast } from 'sonner';

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, syncCart } = useCart();
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    loadSavedAddresses();
    
    // Load persisted checkout data
    const savedData = localStorage.getItem('checkout_data');
    if (savedData) {
      try {
        const { address, payment } = JSON.parse(savedData);
        if (address) setShippingAddress(prev => ({ ...prev, ...address }));
        if (payment) setSelectedPayment(payment);
      } catch (e) {
        console.error('Error parsing saved checkout data', e);
      }
    }
  }, []);

  // Persist checkout data
  useEffect(() => {
    const data = {
      address: shippingAddress,
      payment: selectedPayment
    };
    localStorage.setItem('checkout_data', JSON.stringify(data));
  }, [shippingAddress, selectedPayment]);

  const loadSavedAddresses = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.getAddresses(token);
      if (response.success && response.data) {
        const addresses = response.data as SavedAddress[];
        setSavedAddresses(addresses);
        
        // Auto-select default address
        const defaultAddr = addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          fillAddressForm(defaultAddr);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const fillAddressForm = (address: SavedAddress) => {
    setShippingAddress({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      fillAddressForm(address);
    }
  };

  const deliveryFee = totalPrice > 0 && totalPrice < 500 ? 50 : 0;
  const finalTotal = totalPrice + deliveryFee;

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: Building2, description: 'All major banks' },
    { id: 'wallet', name: 'Wallet', icon: Wallet, description: 'Paytm, Amazon Pay' },
    { id: 'cod', name: 'Cash on Delivery', icon: MapPin, description: 'Pay when you receive' },
  ];

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast.error('Please fill in all shipping details');
      return;
    }

    setProcessing(true);
    try {
      const token = await getToken();
      if (!token) {
        router.push('/sign-in?redirect_url=/checkout');
        return;
      }

      // Save address if checkbox is checked and not using saved address
      if (saveAddress && !selectedAddressId) {
        try {
          await api.createAddress(shippingAddress, token);
        } catch (error) {
          console.error('Error saving address:', error);
        }
      }

      // Sync cart to backend before placing order
      await syncCart();

      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod: selectedPayment,
      };

      const response = await api.createOrder(orderData, token);
      
      if (response.success) {
        await clearCart();
        localStorage.removeItem('checkout_data'); // Clear saved data on success
        router.push('/orders');
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h1 className="text-4xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add items to your cart before checkout</p>
        <button
          onClick={() => router.push('/shop')}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-accent/20">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="p-6 rounded-2xl border-2 border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Saved Addresses</h3>
                </div>
                <div className="grid gap-3">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => handleAddressSelect(addr.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            {addr.fullName}
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                          </div>
                          <div className="text-sm text-muted-foreground">{addr.phone}</div>
                        </div>
                        {selectedAddressId === addr.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSelectedAddressId('');
                    setShippingAddress({
                      fullName: user?.fullName || '',
                      phone: '',
                      address: '',
                      city: '',
                      state: '',
                      pincode: '',
                    });
                  }}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  + Add new address
                </button>
              </div>
            )}

            {/* Shipping Address Form */}
            <div className="p-6 rounded-2xl border-2 border-border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold">
                  {selectedAddressId ? 'Edit Address' : 'Shipping Address'}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Address *</label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors resize-none"
                    rows={3}
                    placeholder="Street address, apartment, suite, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">State *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Pincode *</label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="400001"
                  />
                </div>
              </div>

              {/* Save Address Checkbox */}
              {!selectedAddressId && (
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm font-semibold">Save this address for future orders</span>
                </label>
              )}
            </div>

            {/* Payment Methods */}
            <div className="p-6 rounded-2xl border-2 border-border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedPayment === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          selectedPayment === method.id ? 'bg-primary text-primary-foreground' : 'bg-accent'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1">{method.name}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                        {selectedPayment === method.id && (
                          <div className="p-1 rounded-full bg-primary text-primary-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-2xl border-2 border-border bg-card">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <img
                      src={item.productImage || 'https://via.placeholder.com/60'}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover bg-accent"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{item.productName}</div>
                      <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                      <div className="text-sm font-semibold text-primary">₹{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={processing || !selectedPayment}
                className="w-full mt-6 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {processing ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
