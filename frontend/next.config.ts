import type { NextConfig } from "next";
import withPWAInit from "next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

// Run environment validation on startup
// We do this inline to fail-fast during the build/start phase
import { validateEnv } from './src/lib/env';
validateEnv();

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^\/api\/auth\/.*/i,
      handler: "NetworkOnly",
    },
    {
      urlPattern: /^\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "default-cache",
      },
    },
  ],
});

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Enforce HTTPS
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            // Block clickjacking attempts
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            // Prevent MIME sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            // Ensure referrer is only sent securely cross-origin
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            // Disable unnecessary browser APIs
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  async rewrites() {
    return [
      {
        source: '/.well-known/security.txt',
        destination: '/api/security',
      },
    ];
  }
};

export default withSentryConfig(
  withPWA(nextConfig),
  {
    org: process.env.SENTRY_ORG || "tradevision",
    project: process.env.SENTRY_PROJECT || "frontend",
    silent: !process.env.SENTRY_DEBUG,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    sourcemaps: {
      deleteSourcemapsAfterUpload: true,
    },
    disableLogger: true,
  }
);
