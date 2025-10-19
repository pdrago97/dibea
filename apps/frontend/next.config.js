/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Temporarily disable middleware to fix compilation
  // experimental: {
  //   middlewarePrefetch: true,
  // },
  images: {
    domains: ["localhost", "dibea.com.br"],
    formats: ["image/webp", "image/avif"],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
