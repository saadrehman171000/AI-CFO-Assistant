"use client"

import { UserButton } from "@clerk/nextjs"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TopNavigationProps {
  user: {
    firstName?: string
    emailAddresses?: Array<{
      emailAddress: string
    }>
  }
}

export function TopNavigation({ user }: TopNavigationProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white w-full"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Info */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                {user?.emailAddresses?.[0]?.emailAddress || "user@example.com"}
              </p>
            </div>
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 sm:w-10 sm:h-10",
                  userButtonPopoverCard: "shadow-lg border border-gray-200",
                  userButtonPopoverActionButton: "hover:bg-gray-50",
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
