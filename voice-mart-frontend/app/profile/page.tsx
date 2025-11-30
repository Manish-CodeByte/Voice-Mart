'use client';

import { useUser } from '@clerk/nextjs';
import { User, Mail, Calendar, Shield, Edit } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function ProfilePage() {
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

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border-2 border-border rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'User'}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-3xl ring-4 ring-primary/20">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
                <Edit className="h-4 w-4" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{user.fullName || 'User'}</h2>
              <p className="text-muted-foreground mb-4">{user.emailAddresses[0]?.emailAddress}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                <Shield className="h-3 w-3" />
                Verified Account
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-accent/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Full Name</span>
              </div>
              <p className="font-semibold ml-11">{user.fullName || 'Not set'}</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-accent/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Email Address</span>
              </div>
              <p className="font-semibold ml-11 truncate">{user.emailAddresses[0]?.emailAddress}</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-accent/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Member Since</span>
              </div>
              <p className="font-semibold ml-11">
                {new Date(user.createdAt!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-accent/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Account Status</span>
              </div>
              <p className="font-semibold ml-11 text-green-600 dark:text-green-400">Active</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <button className="p-4 rounded-xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all text-left">
            <h3 className="font-semibold mb-1">Update Profile</h3>
            <p className="text-sm text-muted-foreground">Edit your personal information</p>
          </button>
          <button className="p-4 rounded-xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all text-left">
            <h3 className="font-semibold mb-1">Change Password</h3>
            <p className="text-sm text-muted-foreground">Update your security credentials</p>
          </button>
        </div>
      </div>
    </div>
  );
}
