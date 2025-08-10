"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Sidebar } from "./sidebar"
import { TopNavigation } from "./top-navigation"
import { usePathname } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser()
  const pathname = usePathname()

  // If not signed in and on landing page, show landing page
  if (!isSignedIn && pathname === "/") {
    return <>{children}</>
  }

  // If not signed in and not on landing page, redirect to sign-in
  if (!isSignedIn) {
    return null
  }

  // If signed in, show main layout with sidebar and navigation
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <TopNavigation user={user} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
