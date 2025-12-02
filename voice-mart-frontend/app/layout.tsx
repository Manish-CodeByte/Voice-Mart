import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from 'sonner';
import AuthSync from "@/components/AuthSync";
import { LanguageProvider } from "@/app/context/LanguageContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import VoiceAssistant from "@/components/VoiceAssistant";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Voice Mart - AI Powered Shopping",
  description: "Shop with your voice with all freedom!!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={outfit.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CartProvider>
              <LanguageProvider>
                <VoiceProvider>
                  <AuthSync />
                  <Header />
                  <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
                    {children}
                  </main>
                  <Toaster position="top-right" richColors closeButton expand={false} />
                  <VoiceAssistant />
                </VoiceProvider>
              </LanguageProvider>
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}


