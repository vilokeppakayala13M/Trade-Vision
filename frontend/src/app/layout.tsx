import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { headers } from "next/headers";
import Layout from "@/components/Layout";
import AnimatedLayout from "@/components/AnimatedLayout";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { AuthProvider } from "@/context/AuthContext";
import CookieBanner from "@/components/CookieBanner";
import AnalyticsInit from "@/components/AnalyticsInit";
import JsonLd from "@/components/JsonLd";
import FloatingChatButton from "@/components/chat/FloatingChatButton";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";

const outfit = Outfit({ subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in';

export const metadata: Metadata = {
    // Template for child pages: "IPO Calendar | TradeVision"
    title: {
        default: 'TradeVision — Premium Indian Stock Market Insights',
        template: '%s | TradeVision',
    },
    description:
        'TradeVision delivers live NSE & BSE stock quotes, IPO calendar, F&O futures prices, market news, AI-powered company analysis, SIP/lumpsum calculators, and portfolio tracking for Indian investors.',
    keywords: [
        'NSE live stock prices', 'BSE share market', 'Indian stock market', 'IPO calendar India',
        'futures and options', 'stock analysis India', 'SIP calculator', 'lumpsum calculator',
        'share market news', 'TradeVision', 'portfolio tracker India',
    ],
    metadataBase: new URL(BASE_URL),
    alternates: {
        canonical: BASE_URL,
    },
    manifest: '/manifest.json',
    icons: {
        icon: [
            { url: '/icon', sizes: '32x32', type: 'image/png' },
            { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        ],
        shortcut: '/icon',
        apple: [
            { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
            { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        ],
    },
    // Google Search Console verification
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    openGraph: {
        type: 'website',
        siteName: 'TradeVision',
        locale: 'en_IN',
        url: BASE_URL,
        title: 'TradeVision — Premium Indian Stock Market Insights',
        description:
            'Live NSE & BSE quotes, IPO calendar, futures, market news, and AI-powered stock analysis for Indian investors.',
        images: [
            {
                url: '/opengraph-image.png',
                width: 1200,
                height: 630,
                alt: 'TradeVision — Premium Indian Stock Market Insights',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TradeVision — Premium Indian Stock Market Insights',
        description:
            'Live NSE & BSE quotes, IPO calendar, futures, market news, and AI-powered stock analysis for Indian investors.',
        images: ['/opengraph-image.png'],
    },
};

// WebSite schema with SearchAction for Google Sitelinks Search Box
const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TradeVision',
    url: BASE_URL,
    description: 'Premium Indian stock market insights platform covering NSE and BSE.',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
};

const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TradeVision',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@tradevision.in',
        contactType: 'Customer Support',
        areaServed: 'IN',
        availableLanguage: 'English',
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const nonce = headersList.get('x-nonce') || undefined;

    return (
        <html lang="en-IN">
            <head>
                <script
                    nonce={nonce}
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                if (typeof window !== 'undefined') {
                                    const hostname = window.location.hostname;
                                    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
                                        let currentError = console.error;
                                        Object.defineProperty(console, 'error', {
                                            get() {
                                                const target = currentError;
                                                return function(...args) {
                                                    const fullMsg = args.map(arg => {
                                                        if (!arg) return '';
                                                        if (arg instanceof Error) return arg.message + ' ' + arg.stack;
                                                        return String(arg);
                                                    }).join(' ');
                                                    if (fullMsg.includes('We are cleaning up') && (fullMsg.includes('async info') || fullMsg.includes('Suspense boundary'))) {
                                                        return;
                                                    }
                                                    return target.apply(this, args);
                                                  };
                                              },
                                              set(newValue) {
                                                  currentError = newValue;
                                              },
                                              configurable: true,
                                          });
                                      }
                                  }
                              })();
                          `,
                      }}
                  />
              </head>
              <body className={outfit.className}>
                  {/* Structured Data */}
                  <JsonLd data={websiteSchema} />
                  <JsonLd data={organizationSchema} />
  
                  <AuthProvider>
                      <WatchlistProvider>
                          <Layout>
                              <AnimatedLayout>
                                  {children}
                              </AnimatedLayout>
                          </Layout>
                      </WatchlistProvider>
                  </AuthProvider>
  
                  <CookieBanner />
                  <AnalyticsInit />
                  <InstallPrompt />
                  
                  <FloatingChatButton />
              </body>
          </html>
      );
  }
