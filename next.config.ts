/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backend =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://foodhub-backend-3poi.onrender.com";

    return [
      // better-auth internal routes  →  backend /api/auth/*
      {
        source: "/api/auth/:path*",
        destination: `${backend}/api/auth/:path*`,
      },
      // your app API routes  →  backend /auth/*, /providers/*, /orders/*, etc.
      {
        source: "/api/backend/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;