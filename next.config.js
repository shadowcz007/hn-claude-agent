/** @type {import('next').NextConfig} */
const nextConfig = {
    // Removed output: 'export' to support API routes
    trailingSlash: true, // Add trailing slashes to all routes
    images: {
        unoptimized: true // For better compatibility
    },
    // Removed experimental.appDir as it's no longer needed in Next.js 14
    // Add Fast Refresh configuration
    reactStrictMode: true
        // swcMinify is enabled by default in Next.js 15, no need to specify
};

export default nextConfig;