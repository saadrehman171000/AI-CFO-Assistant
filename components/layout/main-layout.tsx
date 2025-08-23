"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Sidebar } from "./sidebar";
import { TopNavigation } from "./top-navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  // If still loading, show clean loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading AI CFO Assistant...</p>
        </div>
      </div>
    );
  }

  // Show clean, professional main layout
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <TopNavigation user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-full">
            <div className="p-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
