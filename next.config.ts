import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
