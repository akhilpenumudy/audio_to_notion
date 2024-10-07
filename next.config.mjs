/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "audio-to-notion-blob",
        port: "",
      },
    ],
  },
};

export default nextConfig;
