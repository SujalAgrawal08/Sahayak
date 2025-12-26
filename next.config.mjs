/** @type {import('next').NextConfig} */
import withPWAInit from "next-pwa";

// 1. Configure PWA (Service Worker)
const withPWA = withPWAInit({
  dest: "public",         // Where to put the service worker file
  register: true,         // Register automatically
  skipWaiting: true,      // Update cache immediately
  disable: process.env.NODE_ENV === "development", // Disable in dev to prevent caching confusion
});

// 2. Your Existing Next.js Configuration
const nextConfig = {
  reactStrictMode: true,
  
  experimental: {
    serverComponentsExternalPackages: ['mongoose', '@xenova/transformers', 'onnxruntime-node'],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
      canvas: false,
    };
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

// 3. Wrap and Export
export default withPWA(nextConfig);