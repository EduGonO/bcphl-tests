/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536, 1800],
    imageSizes: [96, 128, 160, 192, 224, 256],
  },
  // Ensure sharp (native .node binary module) is not bundled by webpack.
  // Next.js's node file tracer (nft) handles including the correct
  // platform binary (@img/sharp-linux-x64) in the Vercel Lambda bundle.
  // Without this, webpack attempts to bundle sharp, drops the .node file,
  // and the serverless function crashes with:
  //   "Error: Could not load the sharp module using the linux-x64 runtime"
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("sharp");
    }
    return config;
  },
};

module.exports = nextConfig;
