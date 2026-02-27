import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import type { Metadata, Viewport } from "next"; // টাইপ ইমপোর্ট করুন

// এই অংশটি যোগ করুন (Metadata)
export const metadata: Metadata = {
  title: "AutoLead AI Pro",
  description: "AI-Powered SEO Cold Outreach Engine",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AutoLead AI Pro",
  },
};

// ভিউপোর্ট আলাদাভাবে দিতে হয় লেটেস্ট ভার্সনে
export const viewport: Viewport = {
  themeColor: "#dc2626", // আপনার ব্র্যান্ড কালার
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <main>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}