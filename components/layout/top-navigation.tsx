"use client";

import { UserButton } from "@clerk/nextjs";

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
        <div className="flex items-center justify-end">
          {/* User Info and Button */}
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
    </header>
  );
}
