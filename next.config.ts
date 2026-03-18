import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@google-cloud/local-auth', 'googleapis'],
};

export default nextConfig;
