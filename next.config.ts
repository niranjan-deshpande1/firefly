import type { NextConfig } from "next";

// Cover images go up to 5 MB through server actions (default limit is 1 MB).
const nextConfig: NextConfig = { experimental: { serverActions: { bodySizeLimit: "6mb" } } };

export default nextConfig;
