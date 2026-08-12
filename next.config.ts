import type { NextConfig } from "next";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.uploadthing.com https://uploadthing.com https://*.googleusercontent.com https://*.firebasestorage.app;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src 'self' https://apis.google.com https://*.googleapis.com https://firestore.googleapis.com https://*.firebaseio.com https://*.uploadthing.com https://uploadthing.com wss://*.firebaseio.com https://*.firebaseapp.com;
    frame-src 'self' https://*.firebaseapp.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 31536000,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Active les source maps en production pour supprimer le warning de la capture 3
  productionBrowserSourceMaps: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;