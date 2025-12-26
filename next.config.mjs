/** @type {import('next').NextConfig} */
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
      // FIX: Tell webpack to ignore 'canvas' (it is built-in to browser)
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

export default nextConfig;