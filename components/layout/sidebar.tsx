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
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Upload",
    href: "/upload",
    icon: Upload,
    requiresSubscription: true,
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    requiresSubscription: true,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    requiresSubscription: true,
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Forecasting",
    href: "/forecasting",
    icon: TrendingUp,
    requiresSubscription: true,
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    requiresSubscription: false,
    color: "from-gray-500 to-slate-500",
  },
  {
    name: "Subscription",
    href: "/subscription",
    icon: CreditCard,
    requiresSubscription: false,
    color: "from-yellow-500 to-orange-500",
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
      {/* Enhanced 3D Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-30 animate-pulse"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative bg-white/90 backdrop-blur-sm shadow-2xl border border-white/30 hover:bg-white hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced mobile menu overlay with touch capture */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm touch-auto"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Enhanced 3D Sidebar */}
      <div
        className={cn(
          "lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50",
          "fixed inset-y-0 left-0 z-50 w-[250px] sm:w-64 transform transition-all duration-300 ease-out",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="relative h-full">
          {/* Background gradient and blur effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-r-3xl"></div>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-r-3xl border-r border-white/30 shadow-2xl"></div>

          {/* Content */}
          <div className="relative h-full flex flex-col">
            {/* Enhanced 3D Logo */}
            <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 border-b border-white/20 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 sm:space-x-3 group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
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
                  className="relative bg-white/80 border border-white/30 hover:bg-white hover:shadow-lg transition-all"
                >
                  <X className="h-4 w-4 text-gray-600" />
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

            {/* Enhanced 3D Navigation */}
            <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-2 sm:space-y-3 overflow-y-auto touch-auto">
              {isLoading
                ? // Enhanced loading skeleton for navigation items
                  Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-blue-100 rounded-xl opacity-40"></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-lg">
                        <div className="flex items-center space-x-3">
                          <div className="animate-pulse bg-gradient-to-r from-gray-200 to-blue-200 h-5 w-5 rounded-lg"></div>
                          <div className="animate-pulse bg-gradient-to-r from-gray-200 to-blue-200 h-4 w-20 rounded"></div>
                        </div>
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
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        ></div>
                        <Link
                          href={isLocked ? "/subscription" : item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "relative flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-[1.02]",
                            isActive
                              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border border-blue-200/50 shadow-lg"
                              : isLocked
                              ? "text-gray-400 cursor-not-allowed bg-white/60"
                              : "text-gray-700 hover:bg-white/80 hover:text-gray-900 hover:shadow-lg"
                          )}
                          title={
                            isLocked
                              ? "Upgrade to Pro to access this feature"
                              : undefined
                          }
                        >
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 ${
                              isActive
                                ? `bg-gradient-to-r ${item.color}`
                                : isLocked
                                ? "bg-gray-200"
                                : `bg-gradient-to-r ${item.color}`
                            }`}
                          >
                            {isLocked ? (
                              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                            ) : (
                              <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            )}
                          </div>
                          <span className="font-medium">{item.name}</span>
                          {isLocked && (
                            <div className="ml-auto">
                              <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-600" />
                            </div>
                          )}
                        </Link>
                      </div>
                    );
                  })}
            </nav>

            {/* Enhanced 3D Footer */}
            <div className="p-3 sm:p-4 border-t border-white/20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg sm:rounded-xl opacity-40"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg border border-white/30">
                  <div className="text-xs text-gray-500 text-center font-medium">
                    AI CFO Assistant v1.0
                  </div>
                  {isLoading ? (
                    <div className="mt-2 sm:mt-3 text-center">
                      <div className="animate-pulse bg-gradient-to-r from-gray-200 to-blue-200 h-7 sm:h-8 w-full rounded-lg"></div>
                    </div>
                  ) : (
                    !subscriptionStatus?.hasActiveSubscription && (
                      <div className="mt-2 sm:mt-3 text-center">
                        <Link href="/subscription">
                          <Button
                            size="sm"
                            className="w-full text-xs py-1 sm:py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            <span className="text-xs">Upgrade to Pro</span>
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
      </div>
    </>
  );
}
