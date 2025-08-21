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
import { Mail, Calendar, Shield } from "lucide-react";

export function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl">Profile</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage your account settings and preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <p className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                  {user.fullName || "Not provided"}
                </p>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm sm:text-lg text-gray-900 break-all sm:break-normal">
                    {user.primaryEmailAddress?.emailAddress || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">
                  Member Since
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm sm:text-lg text-gray-900">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">
                  Account Status
                </label>
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {user.publicMetadata?.role || "User"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
        </CardContent>
      </Card>
    </div>
  );
}
