/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536, 1800],
    imageSizes: [96, 128, 160, 192, 224, 256],
  },
};

module.exports = nextConfig;
