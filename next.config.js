/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['electrostoregroup.com', 'cdn.shopify.com', 'm.media-amazon.com', 't3.ftcdn.net', 'images-na.ssl-images-amazon.com'],
  },
  rewrites: async () => {
    return [
      {
        source: '/api/marketplaces/productPerformance',
        destination: `${process.env.SHELFCLOUD_SERVER_URL}/marketplaces/products/getProductsPerformance`,
      },
    ]
  },
}

module.exports = nextConfig
