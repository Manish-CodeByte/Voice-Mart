'use client';

import * as React from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { User, Package, Heart, Settings, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (!user) return null;

  const menuItems = [
    { icon: <User className="h-4 w-4" />, label: 'My Profile', href: '/profile' },
    { icon: <Package className="h-4 w-4" />, label: 'My Orders', href: '/orders' },
    { icon: <Heart className="h-4 w-4" />, label: 'Wishlist', href: '/wishlist' },
    { icon: <Settings className="h-4 w-4" />, label: 'Settings', href: '/settings' },
  ];

  const getInitials = () => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-accent transition-colors group"
      >
        {/* Avatar */}
        <div className="relative">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-all"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold text-sm ring-2 ring-border group-hover:ring-primary/50 transition-all">
              {getInitials()}
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
        </div>

        {/* Name on desktop */}
        <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
          {user.firstName || 'User'}
        </span>
        <ChevronDown className={`hidden md:block h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 rounded-xl border-2 border-border bg-popover shadow-2xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="p-4 border-b border-border bg-accent/50">
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'User'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {getInitials()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.fullName || 'User'}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-sm"
              >
                <div className="text-muted-foreground">{item.icon}</div>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Sign Out */}
          <div className="border-t border-border p-2">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-destructive/10 text-destructive rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
