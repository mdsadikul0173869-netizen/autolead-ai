import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // আপনার অন্যান্য কনফিগ
  webpack: (config: any) => {
    config.cache = false;
    return config;
  },
} as any; // এই অংশটি টাইপস্ক্রিপ্ট চেক বাইপাস করবে

export default nextConfig;