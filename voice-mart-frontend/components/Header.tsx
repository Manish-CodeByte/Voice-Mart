import Link from 'next/link';
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ShoppingCart, Mic } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                            <Mic className="h-6 w-6" />
                        </div>
                        <span>Voice Mart</span>
                    </Link>
                </div>

                <nav className="flex items-center gap-6">
                    <Link href="/cart" className="relative group">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            0
                        </span>
                    </Link>

                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="text-sm font-medium hover:underline">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                </nav>
            </div>
        </header>
    );
}
