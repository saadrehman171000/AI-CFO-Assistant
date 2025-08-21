"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Search, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopNavigationProps {
  user: {
    firstName?: string;
    emailAddresses?: Array<{
      emailAddress: string;
    }>;
  };
}

export function TopNavigation({ user }: TopNavigationProps) {
  return (
    <header className="relative overflow-hidden">
      {/* Background gradient and blur effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-white/30"></div>

      {/* Content */}
      <div className="relative px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Enhanced Search Bar - Hidden on small mobile screens */}
          <div className="hidden sm:block flex-1 max-w-md">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search AI CFO features..."
                  className="pl-10 bg-transparent border-0 focus:ring-0 focus:outline-none w-full placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Search icon for small mobile screens */}
          <div className="sm:hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Button
              variant="ghost"
              size="icon"
              className="relative bg-white/90 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Enhanced Notifications */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Button
                variant="ghost"
                size="icon"
                className="relative bg-white/90 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 h-9 w-9 sm:h-10 sm:w-10"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse"></span>
              </Button>
            </div>

            {/* Enhanced User Info */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <div className="text-right hidden md:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-2 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName ||
                        user?.emailAddresses?.[0]?.emailAddress?.split(
                          "@"
                        )[0] ||
                        "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {user?.emailAddresses?.[0]?.emailAddress ||
                        "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced User Button */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox:
                          "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
                        userButtonPopoverCard:
                          "shadow-2xl border border-white/30 bg-white/95 backdrop-blur-xl",
                        userButtonPopoverActionButton:
                          "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
