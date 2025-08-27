import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI CFO Assistant",
  description: "Your intelligent financial management companion",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#2563eb",
          colorText: "#1f2937",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#1f2937",
        },
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          card: "shadow-lg",
          headerTitle: "text-2xl font-bold",
          headerSubtitle: "text-gray-600",
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
