/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
    return [
      // Proxy backend API through Next.js to avoid CORS issues in browser.
      { source: "/api/v1/:path*", destination: `${base}/api/v1/:path*` },
    ];
  },
};

export default nextConfig;
