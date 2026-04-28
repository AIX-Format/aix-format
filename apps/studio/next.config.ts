import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["../../core"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@core": path.resolve(__dirname, "../../core"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@core": "../../core",
    },
  },
};

export default nextConfig;
