/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/reflexion",
        destination: "/Reflexion",
        permanent: false,
      },
      {
        source: "/creation",
        destination: "/Creation",
        permanent: false,
      },
      {
        source: "/irl",
        destination: "/IRL",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
