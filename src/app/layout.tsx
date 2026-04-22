import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Layout from "@/components/Layout";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradeVision - Next Level Insights",
  description: "Premium stock market insights and analysis",
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <AuthProvider>
          <WatchlistProvider>
            <Layout>
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>}>
                {children}
              </Suspense>
            </Layout>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
