/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@ai-contador/shared', '@ai-contador/database'],
    images: {
        domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com']
    }
}

module.exports = nextConfig
