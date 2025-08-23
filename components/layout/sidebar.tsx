"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
  Sparkles,
  Zap,
  Eye,
  Bot,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: any;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    requiresSubscription: true,
    color: "bg-blue-600",
  },
  {
    name: "Upload",
    href: "/upload",
    icon: Upload,
    requiresSubscription: true,
    color: "bg-emerald-600",
  },
  {
    name: "AI Bot",
    href: "/chatbot",
    icon: Bot,
    requiresSubscription: true,
    color: "bg-purple-600",
    featured: true,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    requiresSubscription: true,
    color: "bg-indigo-600",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    requiresSubscription: true,
    color: "bg-orange-600",
  },
  {
    name: "Forecasting",
    href: "/forecasting",
    icon: TrendingUp,
    requiresSubscription: true,
    color: "bg-cyan-600",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    requiresSubscription: false,
    color: "bg-gray-600",
  },
  {
    name: "Subscription",
    href: "/subscription",
    icon: CreditCard,
    requiresSubscription: false,
    color: "bg-amber-600",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch("/api/subscription/status");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }

      // Ensure minimum loading time to prevent flashing
      const elapsed = Date.now() - startTime;
      const minLoadingTime = 500; // 500ms minimum
      if (elapsed < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsed)
        );
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Clean Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg border-gray-200 hover:bg-gray-50 transition-all duration-200"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Clean Professional Sidebar */}
      <div
        className={cn(
          "lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50",
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-out",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full bg-white border-r border-gray-200 shadow-lg">
          {/* Content */}
          <div className="h-full flex flex-col">
            {/* Clean Professional Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 transform group-hover:scale-105">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  {/* Subtle modern accent */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-80"></div>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">
                    AI CFO
                  </span>
                  <div className="text-xs text-gray-500 font-medium">
                    Assistant
                  </div>
                </div>
              </Link>
              {/* Mobile close button */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Enhanced 3D Subscription Status */}
            {isLoading ? (
              <div className="px-4 py-4 border-b border-white/20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-blue-100 rounded-xl opacity-60"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-pulse bg-gradient-to-r from-gray-200 to-blue-200 h-4 w-4 rounded-full"></div>
                      <div className="animate-pulse bg-gradient-to-r from-gray-200 to-blue-200 h-4 w-20 rounded"></div>
                      <div className="animate-pulse bg-gradient-to-r from-gray-200 to-blue-200 h-4 w-16 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-4 border-b border-white/20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl opacity-60"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30">
                    {subscriptionStatus?.hasActiveSubscription ? (
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Crown className="h-4 w-4 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900">
                            Pro Active
                          </span>
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200"
                          >
                            Premium
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-slate-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Lock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            Free Plan
                          </span>
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs border-gray-300 text-gray-500"
                          >
                            Limited
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Clean Professional Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {isLoading
                ? // Clean loading skeleton for navigation items
                  Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="animate-pulse bg-gray-200 h-5 w-5 rounded"></div>
                        <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                      </div>
                    </div>
                  ))
                : navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const isLocked =
                      item.requiresSubscription &&
                      !subscriptionStatus?.hasActiveSubscription;

                    return (
                      <div key={item.name} className="relative group">
                        <Link
                          href={isLocked ? "/subscription" : item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                            isActive
                              ? item.featured
                                ? "bg-purple-100 text-purple-900 border border-purple-200"
                                : "bg-blue-100 text-blue-900 border border-blue-200"
                              : isLocked
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          )}
                          title={
                            isLocked
                              ? "Upgrade to Pro to access this feature"
                              : item.featured
                                ? "Chat with AI about your financial data"
                              : undefined
                          }
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-105",
                              isActive
                                ? item.color
                                : isLocked
                                ? "bg-gray-200"
                                  : item.color
                            )}
                          >
                            {isLocked ? (
                              <Lock className="h-4 w-4 text-gray-400" />
                            ) : (
                                <item.icon className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="font-medium">{item.name}</span>
                          {item.featured && !isLocked && (
                            <Badge className="ml-auto text-xs bg-purple-600 text-white border-0 px-2 py-0.5">
                              NEW
                            </Badge>
                          )}
                          {isLocked && (
                            <div className="ml-auto">
                              <Crown className="h-3 w-3 text-amber-500" />
                            </div>
                          )}
                        </Link>
                      </div>
                    );
                  })}
            </nav>

            {/* Clean Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 text-center font-medium mb-3">
                  AI CFO Assistant v1.0
                </div>
                {isLoading ? (
                  <div className="text-center">
                    <div className="animate-pulse bg-gray-200 h-8 w-full rounded-lg"></div>
                  </div>
                ) : (
                  !subscriptionStatus?.hasActiveSubscription && (
                      <div className="text-center">
                        <Link href="/subscription">
                          <Button
                            size="sm"
                            className="w-full text-xs py-2 bg-amber-500 hover:bg-amber-600 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                          >
                          <Crown className="h-3 w-3 mr-2" />
                          Upgrade to Pro
                        </Button>
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
