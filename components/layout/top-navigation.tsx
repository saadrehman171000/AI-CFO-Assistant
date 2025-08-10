"use client"

import { Bell, Menu, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TopNavigationProps {
  onMenuClick: () => void
}

export function TopNavigation({ onMenuClick }: TopNavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI CFO</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            AI Insights
          </Link>
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Sign in with Clerk</Button>
        </div>
      </div>
    </nav>
  )
}
