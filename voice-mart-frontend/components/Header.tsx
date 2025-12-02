'use client';

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ShoppingCart } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';
import { useCart } from '@/contexts/CartContext';
import { useVoice } from '@/contexts/VoiceContext';
import CartDrawer from './CartDrawer';
import Search from './Search';
import { useState } from 'react';
import { Mic } from 'lucide-react';

import { usePathname } from 'next/navigation';
import { Trans } from '@/app/context/Translator';

export default function Header() {
    const { totalItems, isCartOpen, openCart, closeCart } = useCart();
    const { enableVoice, isVoiceEnabled } = useVoice();
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) return null;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-linear-to-br from-primary to-primary/60 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative bg-linear-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-lg">
                                    <svg className="h-7 w-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Voice Mart
                            </span>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md mx-8">
                            <Search />
                        </div>

                        {/* Navigation */}
                        <nav className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <DarkModeToggle />
                            
                            <button
                                onClick={enableVoice}
                                className={`p-2.5 rounded-lg transition-all duration-300 group ${
                                    isVoiceEnabled 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'hover:bg-accent text-muted-foreground hover:text-primary'
                                }`}
                                title="Try Voice Mode"
                            >
                                <Mic className={`h-5 w-5 ${isVoiceEnabled ? 'animate-pulse' : ''}`} />
                            </button>
                            
                            <button
                                onClick={openCart}
                                className="relative p-2.5 rounded-lg hover:bg-accent transition-colors group"
                            >
                                <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                                        {totalItems > 9 ? '9+' : totalItems}
                                    </span>
                                )}
                            </button>
                            
                            <div className="ml-2">
                                <SignedIn>
                                    <UserMenu />
                                </SignedIn>
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                            <Trans>Sign In</Trans>
                                        </button>
                                    </SignInButton>
                                </SignedOut>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
        </>
    );
}
