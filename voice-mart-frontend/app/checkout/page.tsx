'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CreditCard, Building2, Smartphone, Wallet, ArrowLeft, Check, MapPin, BookmarkCheck, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '@/components/CustomSelect';
import { api } from '@/lib/api';
import Breadcrumbs from '@/components/Breadcrumbs';
import { toast } from 'sonner';
import { Trans } from '@/app/context/Translator';

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

  const handleInputChange = (field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    setSelectedAddressId('');
  };

  useEffect(() => {
    loadSavedAddresses();
    
    // Load persisted checkout data
    const savedData = localStorage.getItem('checkout_data');
    if (savedData) {
      try {
        const { address, payment, saveAddr } = JSON.parse(savedData);
        if (address) setShippingAddress(prev => ({ ...prev, ...address }));
        if (payment) setSelectedPayment(payment);
        if (saveAddr !== undefined) setSaveAddress(saveAddr);
      } catch (e) {
        console.error('Error parsing saved checkout data', e);
      }
    }
  }, []);

  // Persist checkout data
  useEffect(() => {
    const data = {
      address: shippingAddress,
      payment: selectedPayment,
      saveAddr: saveAddress
    };
    localStorage.setItem('checkout_data', JSON.stringify(data));
  }, [shippingAddress, selectedPayment, saveAddress]);

  // Listen for voice payment selection
  useEffect(() => {
    const handleVoicePayment = (event: any) => {
      const { method } = event.detail;
      setSelectedPayment(method);
      toast.success(`Payment method set to ${method.toUpperCase()}`);
    };

    window.addEventListener('voice-select-payment', handleVoicePayment);
    return () => window.removeEventListener('voice-select-payment', handleVoicePayment);
  }, []);

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

  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  const paymentMethods = [
    { id: 'razorpay', name: 'Razorpay Secure', icon: Shield, description: 'Cards, UPI, NetBanking' },
    { id: 'upi', name: 'UPI Apps', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: Building2, description: 'All major banks' },
    { id: 'cod', name: 'Cash on Delivery', icon: MapPin, description: 'Pay when you receive' },
  ];

  const banks = [
    'HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank'
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

    // Payment Validation
    if (selectedPayment === 'card') {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
      
      const testCardNumber = process.env.NEXT_PUBLIC_TEST_CARD_NUMBER;
      const testCardCvv = process.env.NEXT_PUBLIC_TEST_CARD_CVV;

      if (testCardNumber && cardDetails.number.replace(/\s/g, '') !== testCardNumber) {
        toast.error('Invalid Card Number');
        return;
      }
      if (testCardCvv && cardDetails.cvv !== testCardCvv) {
        toast.error('Invalid CVV');
        return;
      }
    }
    if (selectedPayment === 'netbanking' && !selectedBank) {
      toast.error('Please select a bank');
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
          toast.error('Failed to save address, but placing order...');
        }
      }

      // Sync cart to backend before placing order
      await syncCart();

      if (selectedPayment === 'razorpay') {
        // 1. Create Order
        const orderRes = await api.createPaymentOrder(finalTotal, token);
        if (!orderRes.success || !orderRes.data) {
          console.error(orderRes.message)
          toast.error(orderRes.message || 'Failed to create payment order');
          setProcessing(false);
          return;
        }

        const { order } = orderRes.data as any;

        // 2. Load Razorpay Script
        const loadScript = (src: string) => {
          return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
          toast.error('Razorpay SDK failed to load');
          setProcessing(false);
          return;
        }

        // 3. Open Razorpay Modal
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Voice Mart',
          description: 'Order Payment',
          order_id: order.id,
          handler: async function (response: any) {
            // 4. Verify Payment
            try {
              const verifyRes = await api.verifyPayment(response, token);
              if (verifyRes.success) {
                // 5. Place Order in DB
                await createOrderInDb(undefined, response);
              } else {
                toast.error('Payment verification failed');
                setProcessing(false);
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed');
              setProcessing(false);
            }
          },
          prefill: {
            name: shippingAddress.fullName,
            contact: shippingAddress.phone,
            email: user?.primaryEmailAddress?.emailAddress,
          },
          theme: {
            color: '#3b82f6',
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
        
      } else {
        // Standard Order Placement (COD, etc.)
        await createOrderInDb();
      }

    } catch (error) {
      console.error('Error initiating order:', error);
      toast.error('Failed to initiate order. Please try again.');
      setProcessing(false);
    }
  };

  const createOrderInDb = async (initialToken?: string, paymentDetails?: any) => {
    try {
      // Fetch a fresh token to ensure it hasn't expired during payment flow
      const token = await getToken();
      
      if (!token) {
        toast.error('Authentication session expired. Please sign in again.');
        return;
      }

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
        paymentDetails,
      };

      const response = await api.createOrder(orderData, token);
      
      if (response.success) {
        await clearCart();
        localStorage.removeItem('checkout_data');
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
        <h1 className="text-4xl font-bold mb-4"><Trans>Your cart is empty</Trans></h1>
        <p className="text-muted-foreground mb-6"><Trans>Add items to your cart before checkout</Trans></p>
        <button
          onClick={() => router.push('/shop')}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
        >
          <Trans>Continue Shopping</Trans>
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
          <Trans>Back</Trans>
        </button>

        <h1 className="text-4xl font-bold mb-8"><Trans>Checkout</Trans></h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="p-6 rounded-2xl border-2 border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg"><Trans>Saved Addresses</Trans></h3>
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
                                <Trans>DEFAULT</Trans>
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

                  <Trans>+ Add new address</Trans>
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
                  {selectedAddressId ? <Trans>Edit Address</Trans> : <Trans>Shipping Address</Trans>}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2"><Trans>Full Name *</Trans></label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2"><Trans>Phone Number *</Trans></label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2"><Trans>Address *</Trans></label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors resize-none"
                    rows={3}
                    placeholder="Street address, apartment, suite, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2"><Trans>City *</Trans></label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2"><Trans>State *</Trans></label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2"><Trans>Pincode *</Trans></label>
                  <input
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
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
                  <span className="text-sm font-semibold"><Trans>Save this address for future orders</Trans></span>
                </label>
              )}
            </div>

            {/* Payment Methods */}
            <div className="p-6 rounded-2xl border-2 border-border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold"><Trans>Payment Method</Trans></h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPayment === method.id;
                  
                  return (
                    <div key={method.id} className={`rounded-xl border-2 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}>
                      <button
                        onClick={() => setSelectedPayment(method.id)}
                        className="w-full p-4 text-left flex items-center gap-4"
                      >
                        <div className={`p-3 rounded-lg ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-accent'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1"><Trans>{method.name}</Trans></div>
                          <div className="text-sm text-muted-foreground"><Trans>{method.description}</Trans></div>
                        </div>
                        {isSelected && (
                          <div className="p-1 rounded-full bg-primary text-primary-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </button>

                      {/* Dynamic Payment Details */}
                      {isSelected && (
                        <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2">
                          <div className="h-px w-full bg-border mb-4" />
                          
                          {method.id === 'razorpay' && (
                            <div className="text-sm text-muted-foreground">
                              <Trans>You will be redirected to Razorpay's secure payment gateway to complete your transaction.</Trans>
                            </div>
                          )}

                          {method.id === 'upi' && (
                            <div className="space-y-3">
                              <p className="text-sm text-muted-foreground"><Trans>Pay using any UPI app on your phone</Trans></p>
                              <a 
                                href={`upi://pay?pa=krishnapallan128@oksbi&pn=Krishna%20H%20Pallan&am=${finalTotal}&cu=INR`}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#2b2b2b] text-white font-medium hover:bg-black transition-colors"
                              >
                                <Smartphone className="h-4 w-4" />
                                <Trans>Open UPI App</Trans>
                              </a>
                            </div>
                          )}

                          {method.id === 'card' && (
                            <div className="space-y-6">
                              {/* Flip Card Container */}
                              <div className="perspective-1000 w-full h-56 relative cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                                <motion.div
                                  className="w-full h-full relative preserve-3d"
                                  initial={false}
                                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                  style={{ transformStyle: 'preserve-3d' }}
                                >
                                  {/* Front Side */}
                                  <div className="absolute inset-0 backface-hidden rounded-2xl bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a] p-6 text-white shadow-xl border border-white/10 overflow-hidden">
                                    {/* Chip & Contactless */}
                                    <div className="flex justify-between items-start mb-8">
                                      <div className="w-12 h-9 rounded bg-linear-to-br from-yellow-200 to-yellow-500 opacity-90" />
                                      <div className="flex flex-col items-end">
                                        <div className="text-xs font-bold opacity-50 mb-1">CREDIT</div>
                                        <CreditCard className="h-6 w-6 opacity-80" />
                                      </div>
                                    </div>

                                    {/* Card Number */}
                                    <div className="mb-6">
                                      <div className="font-mono text-2xl tracking-widest drop-shadow-md">
                                        {cardDetails.number || '•••• •••• •••• ••••'}
                                      </div>
                                    </div>

                                    {/* Name & Expiry */}
                                    <div className="flex justify-between items-end">
                                      <div>
                                        <div className="text-[10px] opacity-60 uppercase tracking-wider mb-1">Card Holder</div>
                                        <div className="font-medium tracking-wide uppercase text-sm">
                                          {cardDetails.name || 'YOUR NAME'}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-[10px] opacity-60 uppercase tracking-wider mb-1">Expires</div>
                                        <div className="font-medium tracking-wide text-sm">
                                          {cardDetails.expiry || 'MM/YY'}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
                                  </div>

                                  {/* Back Side */}
                                  <div 
                                    className="absolute inset-0 backface-hidden rounded-2xl bg-linear-to-br from-[#2a2a2a] to-[#1a1a1a] text-white shadow-xl border border-white/10 overflow-hidden"
                                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                                  >
                                    <div className="w-full h-12 bg-black mt-6 opacity-90" />
                                    <div className="p-6">
                                      <div className="flex flex-col items-end">
                                        <div className="text-[10px] uppercase opacity-70 mb-1 mr-1">CVV</div>
                                        <div className="w-full h-10 bg-white text-black font-mono flex items-center justify-end px-3 rounded tracking-widest font-bold">
                                          {cardDetails.cvv || '•••'}
                                        </div>
                                      </div>
                                      <div className="mt-8 flex justify-between items-center opacity-50">
                                        <div className="text-xs">Service Code: 404</div>
                                        <Shield className="h-8 w-8" />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </div>

                              {/* Card Form */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <label className="block text-xs font-semibold mb-1.5 ml-1">Card Number</label>
                                  <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    maxLength={19}
                                    value={cardDetails.number}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/\D/g, '');
                                      val = val.replace(/(.{4})/g, '$1 ').trim();
                                      setCardDetails({...cardDetails, number: val});
                                    }}
                                    onFocus={() => setIsFlipped(false)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-all font-mono"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-semibold mb-1.5 ml-1">Card Holder Name</label>
                                  <input
                                    type="text"
                                    placeholder="JOHN DOE"
                                    value={cardDetails.name}
                                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value.toUpperCase()})}
                                    onFocus={() => setIsFlipped(false)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1.5 ml-1">Expiry Date</label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={cardDetails.expiry}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/\D/g, '');
                                      if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                      setCardDetails({...cardDetails, expiry: val});
                                    }}
                                    onFocus={() => setIsFlipped(false)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-all text-center"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1.5 ml-1">CVV / CVC</label>
                                  <input
                                    type="password"
                                    placeholder="123"
                                    maxLength={4}
                                    value={cardDetails.cvv}
                                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                                    onFocus={() => setIsFlipped(true)}
                                    onBlur={() => setIsFlipped(false)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-all text-center tracking-widest"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {method.id === 'netbanking' && (
                            <div className="space-y-3">
                              <label className="text-sm font-medium"><Trans>Select your Bank</Trans></label>
                              <CustomSelect
                                value={selectedBank}
                                onChange={setSelectedBank}
                                options={banks.map(bank => ({ value: bank, label: bank }))}
                                placeholder="Select Bank"
                              />
                            </div>
                          )}

                          {method.id === 'cod' && (
                            <div className="text-sm text-muted-foreground">
                              <Trans>Pay with cash when your order is delivered.</Trans>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-2xl border-2 border-border bg-card">
              <h2 className="text-2xl font-bold mb-6"><Trans>Order Summary</Trans></h2>

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
                  <span className="text-muted-foreground"><Trans>Subtotal</Trans></span>
                  <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground"><Trans>Delivery</Trans></span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600"><Trans>FREE</Trans></span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold text-lg"><Trans>Total</Trans></span>
                  <span className="font-bold text-2xl text-primary">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={processing || !selectedPayment}
                className="w-full mt-6 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {processing ? <Trans>Processing...</Trans> : <Trans>Place Order</Trans>}
              </button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                <Trans>By placing your order, you agree to our Terms of Service and Privacy Policy</Trans>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
