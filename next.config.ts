import path from 'node:path';
import { NextConfig } from 'next';

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Turbopack experimental, remove on Vercel if causing issues
  // turbopack: {
  //   rules: {
  //     "*.{jsx,tsx}": { loaders: [LOADER] }
  //   }
  // }
};

export default nextConfig;
