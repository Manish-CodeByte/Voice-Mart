'use client';

import { useUser } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { MapPin, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Breadcrumbs from '@/components/Breadcrumbs';
import { toast } from 'sonner';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.getAddresses(token);
      if (response.success && response.data) {
        setAddresses(response.data as Address[]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.address || 
        !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.createAddress(newAddress, token);
      if (response.success) {
        await loadAddresses();
        setShowAddressForm(false);
        setNewAddress({
          fullName: user?.fullName || '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false,
        });
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {


    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.deleteAddress(id, token);
      if (response.success) {
        setAddresses(addresses.filter(addr => addr.id !== id));
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.setDefaultAddress(id, token);
      if (response.success) {
        setAddresses(addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id,
        })));
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs />
        
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        {/* User Info Card */}
        <div className="p-6 rounded-2xl border-2 border-border bg-card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {user?.fullName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.fullName || 'User'}</h2>
              <p className="text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="p-6 rounded-2xl border-2 border-border bg-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Saved Addresses</h2>
            </div>
            <button
              onClick={() => setShowAddressForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No saved addresses yet</p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{address.fullName}</h3>
                        {address.isDefault && (
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-1">
                        {address.address}
                      </p>
                      <p className="text-muted-foreground mb-1">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-muted-foreground">
                        Phone: {address.phone}
                      </p>

                      <div className="flex items-center gap-3 mt-3">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="text-sm text-primary hover:underline font-semibold"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-sm text-destructive hover:underline font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <button
            onClick={() => window.location.href = '/orders'}
            className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-all text-left"
          >
            <h3 className="font-bold text-lg mb-2">My Orders</h3>
            <p className="text-sm text-muted-foreground">View your order history</p>
          </button>
          <button
            onClick={() => window.location.href = '/wishlist'}
            className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-all text-left"
          >
            <h3 className="font-bold text-lg mb-2">Wishlist</h3>
            <p className="text-sm text-muted-foreground">Your saved items</p>
          </button>
          <button
            onClick={() => window.location.href = '/settings'}
            className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-all text-left"
          >
            <h3 className="font-bold text-lg mb-2">Settings</h3>
            <p className="text-sm text-muted-foreground">Manage preferences</p>
          </button>
        </div>

        {/* Add Address Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border-2 border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add New Address</h2>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="p-2 rounded-lg hover:bg-accent transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Address *</label>
                    <textarea
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors resize-none"
                      rows={3}
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">State *</label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Pincode *</label>
                    <input
                      type="text"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-primary outline-none transition-colors"
                      placeholder="400001"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm font-semibold">Set as default address</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-border hover:bg-accent transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAddress}
                    disabled={saving}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
