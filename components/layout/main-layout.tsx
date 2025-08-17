"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Sidebar } from "./sidebar"
import { TopNavigation } from "./top-navigation"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()

  // If still loading, show enhanced loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-8 shadow-2xl border border-white/30">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show main layout with enhanced 3D sidebar and navigation
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <TopNavigation user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4">
          <div className="relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 rounded-3xl opacity-30"></div>
            <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 min-h-full">
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
