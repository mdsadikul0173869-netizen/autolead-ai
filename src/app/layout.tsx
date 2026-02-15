import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* আপনি চাইলে এখানে আন্তঃজাতিক স্ট্যান্ডার্ড বজায় রাখতে পারেন */}
        <body>
          <main>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}