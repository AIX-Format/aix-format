import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
