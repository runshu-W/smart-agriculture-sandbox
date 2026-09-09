import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const localIpv4Origins = Object.values(networkInterfaces())
  .flatMap((addresses) => addresses ?? [])
  .filter((address) => address.family === "IPv4")
  .map((address) => address.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: [...new Set(["127.0.0.1", "localhost", ...localIpv4Origins])],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
