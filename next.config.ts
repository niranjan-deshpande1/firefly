import type { NextConfig } from "next";

// Cover images go up to 4 MB through server actions (default limit is 1 MB; Vercel caps bodies at 4.5 MB).
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// ponytail: no CSP yet; add a nonce-based one before a public deploy.
const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "4.5mb" } },
  // The SQLite demo database ships with every server function (see lib/db).
  outputFileTracingIncludes: { "/**": ["./prisma/demo.db"] },
  headers: async () => [{ source: "/:path*", headers: SECURITY_HEADERS }],
};

export default nextConfig;
