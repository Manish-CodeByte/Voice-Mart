'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mic, Camera, Globe, Zap, ArrowRight, Check, Sparkles } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Elegant background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">Powered by Gemini AI</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Shop with your
              <span className="block mt-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Voice & Vision
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The most intuitive shopping experience. Speak naturally or upload a photo—our AI understands and finds exactly what you need.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all font-medium">
                <Mic className="h-4 w-4 text-primary" />
                Try Voice Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful AI Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced technology that makes shopping feel like magic
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="h-6 w-6" />,
                title: 'Voice Shopping',
                description: 'Speak naturally in any language. Our AI understands context and finds products for you.',
                color: 'primary',
              },
              {
                icon: <Camera className="h-6 w-6" />,
                title: 'Visual Search',
                description: 'Upload a photo to find similar products instantly using advanced computer vision.',
                color: 'secondary',
              },
              {
                icon: <Globe className="h-6 w-6" />,
                title: 'Multilingual',
                description: 'Shop in English, Kannada, Tulu, Hindi, and more. True language freedom.',
                color: 'primary',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-8 rounded-2xl border border-border hover:border-primary/30 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={`mb-4 inline-flex p-3 rounded-xl bg-${feature.color}/10 text-${feature.color} shadow-lg shadow-${feature.color}/10`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-accent/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to start shopping smarter</p>
          </div>

          <div className="space-y-6">
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
              <div
                key={idx}
                className="flex gap-6 items-start p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center font-bold shadow-lg shadow-primary/20">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary mb-1">STEP {item.step}</div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Products' },
              { value: '10+', label: 'Languages' },
              { value: '99%', label: 'Accuracy' },
              { value: '24/7', label: 'Support' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of users shopping smarter with Voice Mart today.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-semibold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span>Voice Mart</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Voice Mart. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
