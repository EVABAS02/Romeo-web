import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'firebasestorage.googleapis.com' },
      { hostname: 'uploadthing.com' },
      { hostname: 'utfs.io' },
    ],
  },
};

export default nextConfig;