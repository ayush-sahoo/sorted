/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ['@anthropic-ai/sdk'] },
};

export default nextConfig;
