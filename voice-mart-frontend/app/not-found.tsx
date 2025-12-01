import Link from 'next/link';
import { Home, Search, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative inline-flex p-8 rounded-3xl bg-linear-to-br from-primary/10 to-secondary/10 border-2 border-border">
            <AlertCircle className="h-24 w-24 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-7xl font-bold mb-4 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all"
          >
            <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-primary/30 bg-card hover:bg-primary/5 transition-all font-medium"
          >
            <Search className="h-5 w-5" />
            Browse Products
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/profile" className="text-primary hover:underline">My Profile</Link>
            <Link href="/orders" className="text-primary hover:underline">My Orders</Link>
            <Link href="/wishlist" className="text-primary hover:underline">Wishlist</Link>
            <Link href="/settings" className="text-primary hover:underline">Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
