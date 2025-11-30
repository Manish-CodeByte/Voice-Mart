import Link from "next/link";
import { Mic, ShoppingBag, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center space-y-8">
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Shop with your Voice
        </h1>
        <p className="text-xl text-muted-foreground md:text-2xl max-w-[600px] mx-auto">
          Experience the future of shopping. Just speak naturally in English, Kannada, or Tulu.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Start Shopping
          <ShoppingBag className="ml-2 h-5 w-5" />
        </Link>
        <button
          className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Try Voice Demo
          <Mic className="ml-2 h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left max-w-5xl w-full">
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <Mic className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-xl mb-2">Multi-Language Support</h3>
          <p className="text-muted-foreground">Speak in English, Kannada, or Tulu. Our AI understands your local context perfectly.</p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="h-12 w-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-xl mb-2">Smart Cart Actions</h3>
          <p className="text-muted-foreground">"Add soap to cart", "Remove milk". Manage your shopping list entirely by voice.</p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="h-12 w-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-4">
            <ArrowRight className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-xl mb-2">Instant Results</h3>
          <p className="text-muted-foreground">Powered by Gemini AI for lightning-fast understanding and accurate product matching.</p>
        </div>
      </div>
    </div>
  );
}
