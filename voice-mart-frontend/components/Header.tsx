import Link from 'next/link';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ShoppingCart } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/30 transition-all duration-300" />
                            <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                                <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-lg font-semibold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">Voice Mart</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <DarkModeToggle />
                        
                        <Link 
                            href="/cart" 
                            className="relative p-2.5 rounded-lg hover:bg-accent transition-colors group"
                        >
                            <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                                0
                            </span>
                        </Link>
                        
                        <div className="ml-2">
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
