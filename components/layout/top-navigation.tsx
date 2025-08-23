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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Clean Search Bar - Hidden on small mobile screens */}
          <div className="hidden sm:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search AI CFO features..."
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Search icon for small mobile screens */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Clean Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </div>

            {/* Clean User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName ||
                    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
                    "User"}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {user?.emailAddresses?.[0]?.emailAddress ||
                    "user@example.com"}
                </p>
              </div>

              {/* Clean User Button */}
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      "w-10 h-10 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105",
                    userButtonPopoverCard:
                      "shadow-lg border border-gray-200 bg-white",
                    userButtonPopoverActionButton:
                      "hover:bg-gray-50 transition-all duration-200",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
