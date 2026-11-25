/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    // Lint runs separately in CI; do not block production builds.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
