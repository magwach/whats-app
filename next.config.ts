import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "perfect-meadowlark-954.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
