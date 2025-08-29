"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Calendar,
  Shield,
  Settings,
  User
} from "lucide-react";

export function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Clean Professional Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Profile Settings</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Manage your account information
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <UserButton />
          </div>
        </div>
      </div>

      {/* User Information Card */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg text-gray-900">Account Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600">
                Your personal details and account status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="text-xs sm:text-sm font-medium text-gray-500">
                Full Name
              </label>
              <p className="text-sm sm:text-base font-semibold text-gray-900 mt-1 break-words">
                {user.fullName || "Not provided"}
              </p>
            </div>

            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="text-xs sm:text-sm font-medium text-gray-500">
                Email Address
              </label>
              <div className="flex items-start space-x-2 mt-1">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-base text-gray-900 break-all min-w-0">
                  {user.primaryEmailAddress?.emailAddress || "Not provided"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="text-xs sm:text-sm font-medium text-gray-500">
                  Member Since
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="text-xs sm:text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Shield className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <Badge variant="secondary" className="text-xs">
                    {(user.publicMetadata?.role as string) || "User"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}