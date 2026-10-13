import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // A cota de Image Optimization da Vercel (plano Hobby) esgotou e o endpoint
    // /_next/image passou a responder 402 (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED),
    // quebrando todas as imagens. As fotos já são comprimidas no upload
    // (ver src/lib/compress-image.ts) e servidas direto pelo CDN do Supabase.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'useazevedo.vercel.app',
      },
    ],
  },
};

export default nextConfig;
