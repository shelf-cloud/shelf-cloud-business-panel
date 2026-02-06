// @ts-check

const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'electrostoregroup.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 't3.ftcdn.net' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
    ],
  },
  sassOptions: {
    loadPaths: [path.join(__dirname, 'node_modules')],
    quietDeps: true,
    silenceDeprecations: ['import'],
  },
}

module.exports = nextConfig
