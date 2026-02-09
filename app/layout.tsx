import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// এখানে তোমার প্রজেক্টের নাম ও ডেসক্রিপশন সেট করা হলো
export const metadata: Metadata = {
  title: "AutoLead AI - Master Lead Finder",
  description: "Advanced AI-Powered Lead Generation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}