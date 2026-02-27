/** @type {import('next').NextConfig} */
const nextConfig = {
  /* ইএস-লিন্ট বা টাইপস্ক্রিপ্ট এরর বিল্ডের সময় ইগনোর করার জন্য */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* পিডব্লিউএ বা বড় ফাইলের জন্য মেমোরি ফিক্স */
  webpack: (config: any) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;