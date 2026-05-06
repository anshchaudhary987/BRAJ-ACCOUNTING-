import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      // Disable turbo for now if it's causing issues with native modules
    }
  }
};

export default nextConfig;
