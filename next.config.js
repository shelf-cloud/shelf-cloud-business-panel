/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['electrostoregroup.com','cdn.shopify.com', 'm.media-amazon.com', 't3.ftcdn.net', 'images-na.ssl-images-amazon.com'],
  },
}

module.exports = nextConfig
