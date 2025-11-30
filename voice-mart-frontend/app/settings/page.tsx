'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { Bell, Lock, Globe, Moon, Sun, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Breadcrumbs from '@/components/Breadcrumbs';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

useEffect(() => {
    setMounted(true);
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.getPreferences(token);
      if (response.success && response.data) {
        const data = response.data as { orderUpdates?: boolean; promotions?: boolean; newsletter?: boolean };
        setNotifications({
          orderUpdates: data.orderUpdates ?? true,
          promotions: data.promotions ?? false,
          newsletter: data.newsletter ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      await api.updatePreferences(newNotifications, token);
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Revert on error
      setNotifications(notifications);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs />
        
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        {/* Account Settings */}
        <div className="p-6 rounded-2xl border-2 border-border bg-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Account</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50">
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
                Change
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50">
              <div>
                <h3 className="font-semibold mb-1">Password</h3>
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="p-6 rounded-2xl border-2 border-border bg-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Theme</h3>
              {!mounted ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border-2 border-border bg-accent/50 animate-pulse h-24" />
                  <div className="p-4 rounded-xl border-2 border-border bg-accent/50 animate-pulse h-24" />
                  <div className="p-4 rounded-xl border-2 border-border bg-accent/50 animate-pulse h-24" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Sun className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-semibold">Light</div>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Moon className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-semibold">Dark</div>
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'system'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Monitor className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-semibold">System</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {loading ? (
          <div className="p-6 rounded-2xl border-2 border-border bg-card mb-6 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 rounded-2xl border-2 border-border bg-card mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Notifications</h2>
              {saving && <span className="text-sm text-muted-foreground">Saving...</span>}
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-accent/50 cursor-pointer">
                <div>
                  <h3 className="font-semibold mb-1">Order Updates</h3>
                  <p className="text-sm text-muted-foreground">Get notified about your order status</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.orderUpdates}
                  onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
                  disabled={saving}
                  className="w-12 h-6 rounded-full bg-border checked:bg-primary relative appearance-none cursor-pointer transition-colors disabled:opacity-50
                    before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white 
                    before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-accent/50 cursor-pointer">
                <div>
                  <h3 className="font-semibold mb-1">Promotions & Offers</h3>
                  <p className="text-sm text-muted-foreground">Receive exclusive deals and offers</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.promotions}
                  onChange={(e) => handleNotificationChange('promotions', e.target.checked)}
                  disabled={saving}
                  className="w-12 h-6 rounded-full bg-border checked:bg-primary relative appearance-none cursor-pointer transition-colors disabled:opacity-50
                    before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white 
                    before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-accent/50 cursor-pointer">
                <div>
                  <h3 className="font-semibold mb-1">Newsletter</h3>
                  <p className="text-sm text-muted-foreground">Weekly updates and new products</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.newsletter}
                  onChange={(e) => handleNotificationChange('newsletter', e.target.checked)}
                  disabled={saving}
                  className="w-12 h-6 rounded-full bg-border checked:bg-primary relative appearance-none cursor-pointer transition-colors disabled:opacity-50
                    before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white 
                    before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
                />
              </label>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl border-2 border-destructive/50 bg-destructive/5">
          <h2 className="text-2xl font-bold text-destructive mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <button className="w-full p-4 rounded-xl border-2 border-destructive/50 hover:bg-destructive/10 transition-all text-left">
              <h3 className="font-semibold text-destructive mb-1">Delete Account</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
