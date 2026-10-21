import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Same-origin proxy for the FastAPI backend. Keeps the session cookie
  // same-site (cookie is host-scoped to the frontend origin) and avoids
  // Windows localhost→::1 resolution quirks in dev.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.LMS_API_PROXY_URL ?? "http://127.0.0.1:4000"}/api/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
