import type { NextConfig } from 'next'

// The homepage links to the product at /auth/signin, /auth/signup and
// /agents. Set APP_URL (e.g. https://app.example.com) in the deployment and
// those paths redirect to the real app; without it they are left as-is.
const APP_URL = process.env.APP_URL?.replace(/\/$/, '')

const nextConfig: NextConfig = {
  async redirects() {
    if (!APP_URL)
      return []
    return [
      { source: '/auth/:path*', destination: `${APP_URL}/auth/:path*`, permanent: false },
      { source: '/agents', destination: `${APP_URL}/agents`, permanent: false },
    ]
  },
}

export default nextConfig
