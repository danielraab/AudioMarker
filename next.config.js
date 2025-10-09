/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
// Sentry wrapper (imported lazily to avoid build issues if not installed yet)
import * as Sentry from '@sentry/nextjs';
import { execSync } from 'child_process';

// Get git version at build time
// Priority: environment variable (for Docker builds) > git tag > git hash > fallback
const getGitVersion = () => {
  // Check if already set via environment (Docker build arg)
  if (process.env.NEXT_PUBLIC_GIT_VERSION_LABEL) {
    return process.env.NEXT_PUBLIC_GIT_VERSION_LABEL;
  }
  
  // Try to get from git
  try {
    // First, try to get the current tag (if on a tagged commit)
    try {
      const tag = execSync('git describe --exact-match --tags HEAD 2>/dev/null').toString().trim();
      if (tag) return tag;
    } catch {
      // Not on a tagged commit, continue to next method
    }
    
    // Try to get the most recent tag with commit count and hash
    try {
      const describe = execSync('git describe --tags --always --dirty 2>/dev/null').toString().trim();
      if (describe) return describe;
    } catch {
      // No tags exist, fall back to commit hash
    }
    
    // Fall back to short commit hash
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    return 'dev';
  }
};

/** @type {import("next").NextConfig} */
const config = {
  output: 'standalone',
  
  env: {
    NEXT_PUBLIC_GIT_VERSION_LABEL: getGitVersion(),
  },
  
  // Ensure service worker and manifest are accessible
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

export default Sentry.withSentryConfig(config, {
  org: "draab",
  project: "Audio Marker",

  tunnelRoute: "/api/tunnel",

  silent: (process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT) === 'production',
  disableLogger: true,
});
