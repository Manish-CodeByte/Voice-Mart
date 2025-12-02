'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mic, Camera, Globe, Zap, ArrowRight, Check, Sparkles, ShoppingBag, Star, TrendingUp, Users, Shield } from 'lucide-react';
import { Trans } from '@/app/context/Translator';
import { useUser } from '@clerk/nextjs';

const Landing = () => {
  const { isSignedIn } = useUser();
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Enhanced background with grid pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-20" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            {/* Enhanced Badge with more detail */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-linear-to-r from-primary/10 to-secondary/10 text-sm font-medium backdrop-blur-sm shadow-lg shadow-primary/10">
              <div className="relative">
                <Sparkles className="h-4 w-4 text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-md -z-10" />
              </div>
              <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                <Trans>Powered with ❤️ to Serve</Trans>
              </span>
            </div>

            {/* Heading with better emphasis */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <Trans>Shop with your</Trans>
                <span className="block mt-2 bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  <Trans>Voice & Vision</Trans>
                </span>
              </h1>
              
              {/* Enhanced Subheading */}
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                <Trans>The most intuitive shopping experience. Speak naturally or upload a photo—our AI understands and finds exactly what you need.</Trans>
              </p>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium">4.9/5 Rating</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">50K+ Users</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">100% Secure</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons with more emphasis */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                href="/shop"
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative"><Trans>Start Shopping</Trans></span>
                <ArrowRight className="relative h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-primary/30 bg-card hover:bg-primary/5 hover:border-primary/50 transition-all font-medium shadow-sm hover:shadow-lg">
                <Mic className="h-4 w-4 text-primary" />
                <Trans>Try Voice Demo</Trans>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with enhanced cards */}
      <section className="py-24 px-6 bg-accent/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
              <Trans>Features</Trans>
            </div>
            <h2 className="text-4xl font-bold"><Trans>Powerful AI Features</Trans></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              <Trans>Advanced technology that makes shopping feel like magic</Trans>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Mic className="h-6 w-6" />,
                title: 'Voice Shopping',
                description: 'Speak naturally in any language. Our AI understands context and finds products for you.',
                color: 'primary',
                badge: 'AI Powered',
              },
              {
                icon: <Camera className="h-6 w-6" />,
                title: 'Visual Search',
                description: 'Upload a photo to find similar products instantly using advanced computer vision.',
                color: 'secondary',
                badge: 'Smart',
              },
              {
                icon: <Globe className="h-6 w-6" />,
                title: 'Multilingual',
                description: 'Shop in English, Kannada, Tulu, Hindi, and more. True language freedom.',
                color: 'primary',
                badge: '10+ Languages',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-8 rounded-2xl border-2 border-border hover:border-primary/30 bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                    {feature.badge}
                  </span>
                </div>
                
                <div className="mb-6 inline-flex p-4 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-lg shadow-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3"><Trans>{feature.title}</Trans></h3>
                <p className="text-muted-foreground leading-relaxed">
                  <Trans>{feature.description}</Trans>
                </p>
                
                {/* Decorative element */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
              <Trans>How It Works</Trans>
            </div>
            <h2 className="text-4xl font-bold"><Trans>Three Simple Steps</Trans></h2>
            <p className="text-muted-foreground text-lg"><Trans>Get started in minutes</Trans></p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Sign In',
                description: 'Create your account with Clerk authentication in seconds.',
                icon: <Check className="h-5 w-5" />,
              },
              {
                step: '02',
                title: 'Search Your Way',
                description: 'Use voice commands, upload photos, or type—whatever feels natural.',
                icon: <Mic className="h-5 w-5" />,
              },
              {
                step: '03',
                title: 'Shop & Checkout',
                description: 'Add items to cart and complete secure checkout with Razorpay.',
                icon: <Zap className="h-5 w-5" />,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {/* Connecting line */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-px bg-border" />
                )}
                
                <div className="relative p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all">
                  {/* Step number badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-linear-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30">
                    {item.step}
                  </div>
                  
                  <div className="pt-6">
                    <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2"><Trans>{item.title}</Trans></h3>
                    <p className="text-muted-foreground leading-relaxed"><Trans>{item.description}</Trans></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats with enhanced design */}
      <section className="py-20 px-6 bg-accent/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: 'Products', icon: <ShoppingBag className="h-5 w-5" /> },
              { value: '10+', label: 'Languages', icon: <Globe className="h-5 w-5" /> },
              { value: '99%', label: 'Accuracy', icon: <TrendingUp className="h-5 w-5" /> },
              { value: '24/7', label: 'Support', icon: <Shield className="h-5 w-5" /> },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl border-2 border-border bg-card text-center hover:border-primary/30 hover:shadow-xl transition-all">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-3 ring-1 ring-primary/20">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold"><Trans>{stat.label}</Trans></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Enhanced */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-20" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary font-semibold"><Trans>Start Your Journey</Trans></span>
          </div>
          
          <h2 className="text-5xl font-bold mb-6"><Trans>Ready to get started?</Trans></h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            <Trans>Join thousands of users shopping smarter with Voice Mart today. Experience the future of e-commerce.</Trans>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isSignedIn && (
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative"><Trans>Get Started Free</Trans></span>
                <ArrowRight className="relative h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link
              href="/learn-more"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl border-2 border-primary/30 bg-card hover:bg-primary/5 transition-all font-medium"
            >
              <Trans>Learn More</Trans>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with more detail */}
      <footer className="border-t-2 border-border bg-card/50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl mb-4">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 ring-2 ring-primary/20">
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <span>Voice Mart</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                The future of shopping powered by AI. Shop with your voice and vision in multiple languages.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Voice Mart. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
