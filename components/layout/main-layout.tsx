"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Sidebar } from "./sidebar"
import { TopNavigation } from "./top-navigation"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()

  // If still loading, show loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show main layout with sidebar and navigation
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <TopNavigation user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
