import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.15"],
  reactStrictMode: true,
  distDir: "dist",
  trailingSlash: true,
  images: {
    /* Enable Next.js image optimization (was previously disabled).
       This enables automatic format conversion (WebP/AVIF), resizing,
       and lazy loading — critical for LCP and page weight. */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
