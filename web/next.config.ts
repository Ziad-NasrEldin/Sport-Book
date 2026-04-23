import path from 'node:path'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'
import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['localhost', '127.0.0.1', 'sport-book.mavoid.com'],
  turbopack: {
    // Keep dev watcher scoped to web app folder.
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
}

export default function nextConfig(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return baseConfig
  }

  return {
    ...baseConfig,
    outputFileTracingRoot: path.resolve(__dirname, '..'),
  }
}
