/** @type {import('next').NextConfig} */
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  
  experimental: {
    // 1. Keep your existing external packages
    serverComponentsExternalPackages: [
      'mongoose', 
      '@xenova/transformers', 
      'onnxruntime-node', 
      'pdf2json',
      'tesseract.js', 
    ],
    // 2. NEW: Force Vercel to include Tesseract WASM files in the build
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/tesseract.js-core/**/*.wasm', './node_modules/**/*.wasm']
    }
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

export default withPWA(nextConfig);