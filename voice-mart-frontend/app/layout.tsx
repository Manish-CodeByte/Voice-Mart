import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import UserSync from "@/components/UserSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Voice Mart - AI Powered Shopping",
  description: "Shop with your voice using Gemini AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <UserSync />
          <Header />
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
