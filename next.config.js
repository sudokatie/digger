/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/games/digger',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
