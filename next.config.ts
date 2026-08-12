import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compression et conversion automatique des images au format Next-Gen (AVIF / WebP)
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // Conservation en cache CDN pendant 1 an
  },
  
  // Nettoyage automatique des logs console en production pour soulager le navigateur
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;