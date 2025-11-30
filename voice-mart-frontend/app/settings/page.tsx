'use client';

import { useUser } from '@clerk/nextjs';
import { Bell, Lock, Globe, Moon, Sun, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs />
        
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        {/* Account Settings */}
        <div className="p-6 rounded-2xl border-2 border-border bg-card mb-6">
          <div className="flex items center gap-3 mb-6">
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
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-2xl border-2 border-border bg-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Notifications</h2>
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
                onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                className="w-12 h-6 rounded-full bg-border checked:bg-primary relative appearance-none cursor-pointer transition-colors
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
                onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                className="w-12 h-6 rounded-full bg-border checked:bg-primary relative appearance-none cursor-pointer transition-colors
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
                onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
                className="w-12 h-6 rounded-full bg-border checked:bg-primary relative appearance-none cursor-pointer transition-colors
                  before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white 
                  before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
              />
            </label>
          </div>
        </div>

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
