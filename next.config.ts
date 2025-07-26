/** @type {import('next').NextConfig} */
import nextPwa from '@ducanh2912/next-pwa';

const withPWA = nextPwa({
  dest: 'public',
  // Schakel PWA alleen uit in development
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    // Import je eigen SW-bestand met push-event-handlers
    importScripts: ['/custom-sw.js'],
    skipWaiting: true,
    clientsClaim: true,
    // andere opties blijven ongewijzigd
    disableDevLogs: true,
  },
});

const nextConfig = withPWA({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
});

module.exports = nextConfig;
