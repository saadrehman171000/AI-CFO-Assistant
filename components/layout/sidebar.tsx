"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  FileText,
  TrendingUp,
  Upload,
  CreditCard,
  User,
  Menu,
  X,
  Crown,
  Lock,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: any;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresSubscription: true },
  { name: 'Upload', href: '/upload', icon: Upload, requiresSubscription: true },
  { name: 'Reports', href: '/reports', icon: FileText, requiresSubscription: true },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, requiresSubscription: true },
  { name: 'Forecasting', href: '/forecasting', icon: TrendingUp, requiresSubscription: true },
  { name: 'Profile', href: '/profile', icon: User, requiresSubscription: false },
  { name: 'Subscription', href: '/subscription', icon: CreditCard, requiresSubscription: false }
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionStatus(data)
      }
      
      // Ensure minimum loading time to prevent flashing
      const elapsed = Date.now() - startTime;
      const minLoadingTime = 500; // 500ms minimum
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200",
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI CFO</span>
          </Link>
        </div>

        {/* Subscription Status */}
        {isLoading ? (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse bg-gray-200 h-4 w-4 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-b border-gray-200">
            {subscriptionStatus?.hasActiveSubscription ? (
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">Pro Active</span>
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Free Plan</span>
                <Badge variant="outline" className="text-xs">Limited</Badge>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {isLoading ? (
            // Loading skeleton for navigation items
            Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 px-3 py-2">
                <div className="animate-pulse bg-gray-200 h-5 w-5 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
              </div>
            ))
          ) : (
            navigation.map((item) => {
              const isActive = pathname === item.href
              const isLocked = item.requiresSubscription && !subscriptionStatus?.hasActiveSubscription
              
              return (
                <Link
                  key={item.name}
                  href={isLocked ? '/subscription' : item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : isLocked
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isLocked ? "Upgrade to Pro to access this feature" : undefined}
                >
                  {isLocked ? <Lock className="h-4 w-4" /> : <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                  {isLocked && (
                    <Crown className="h-3 w-3 text-yellow-600 ml-auto" />
                  )}
                </Link>
              )
            })
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            AI CFO Assistant v1.0
          </div>
          {isLoading ? (
            <div className="mt-2 text-center">
              <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
            </div>
          ) : (
            !subscriptionStatus?.hasActiveSubscription && (
              <div className="mt-2 text-center">
                <Link href="/subscription">
                  <Button size="sm" className="w-full text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </>
  )
}
