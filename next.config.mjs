/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable ESLint
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization.splitChunks = false;
    }
    
    // Handle Node.js built-in modules
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        'pg-native': false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
