'use client';

import { useUser } from '@clerk/nextjs';
import { Bell, Lock, Globe, Palette, CreditCard, Shield } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    redirect('/');
  }

  const settingsSections = [
    {
      icon: <Bell className="h-5 w-5" />,
      title: 'Notifications',
      description: 'Manage email and push notifications',
      action: 'Configure',
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: 'Privacy & Security',
      description: 'Control your privacy settings',
      action: 'Manage',
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: 'Language & Region',
      description: 'Set your preferred language',
      action: 'Change',
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: 'Appearance',
      description: 'Customize your theme preferences',
      action: 'Customize',
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: 'Payment Methods',
      description: 'Manage saved payment options',
      action: 'Update',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Account Security',
      description: 'Two-factor authentication and more',
      action: 'Setup',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* Settings Grid */}
        <div className="space-y-4">
          {settingsSections.map((section, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg border-2 border-border hover:border-primary/30 hover:bg-accent transition-all font-medium text-sm">
                  {section.action}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 p-6 rounded-2xl border-2 border-destructive/20 bg-destructive/5">
          <h3 className="font-bold text-lg mb-2 text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These actions are irreversible. Please be careful.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all font-medium text-sm">
              Delete Account
            </button>
            <button className="px-4 py-2 rounded-lg border-2 border-border hover:border-destructive/30 transition-all font-medium text-sm">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
