// @ts-check

const path = require('path')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'",
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // {
  //   key: 'Permissions-Policy',
  //   value: 'camera=(), microphone=(), geolocation=(), payment=()',
  // },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
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
  turbopack: {
    resolveAlias: {
      // Pin sonner to one concrete file. Its dual ESM/CJS exports get
      // instantiated as separate module copies across chunk graphs, so the
      // toast() dispatcher and the mounted <Toaster/> end up with different
      // internal ToastState singletons — toasts fire but never render.
      sonner: './node_modules/sonner/dist/index.mjs',
    },
  },
  webpack: (config) => {
    config.resolve.alias.sonner = path.join(__dirname, 'node_modules/sonner/dist/index.mjs')
    return config
  },
}

module.exports = nextConfig
