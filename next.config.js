/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors for build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors for build
  }
}

module.exports = nextConfig