"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveFile } from "@/components/contexts/active-file-context";
import {
  Mail,
  Calendar,
  Shield,
  FileText,
  Upload,
  FolderOpen,
  CheckCircle,
  Sparkles,
  Settings,
  User
} from "lucide-react";

interface UserFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeMb: number;
  uploadDate: string;
  isMultiFileAnalysis: boolean;
  multiFileAnalysisGroupId: string | null;
}

export function UserProfile() {
  const { user, isLoaded } = useUser();
  const { activeFile, setActiveFile, loading: activeFileLoading } = useActiveFile();
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [switchingFile, setSwitchingFile] = useState(false);

  // Fetch user files
  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const response = await fetch("/api/user-files");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserFiles(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching user files:", error);
      } finally {
        setLoadingFiles(false);
      }
    };

    if (isLoaded && user) {
      fetchUserFiles();
    }
  }, [isLoaded, user]);

  const handleFileSelect = async (fileId: string) => {
    setSwitchingFile(true);
    try {
      await setActiveFile(fileId);
    } catch (error) {
      console.error("Error switching file:", error);
    } finally {
      setSwitchingFile(false);
    }
  };

  const formatFileSize = (sizeMb: number) => {
    if (sizeMb < 1) {
      return `${(sizeMb * 1024).toFixed(0)} KB`;
    }
    return `${sizeMb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isLoaded || !user) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Clean Professional Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
              <p className="text-sm text-gray-600">
                Manage your account and financial data preferences
              </p>
            </div>
          </div>
          <UserButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information Card */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Account Information</CardTitle>
                <CardDescription className="text-gray-600">
                  Your personal details and account status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {user.fullName || "Not provided"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="text-sm font-medium text-gray-500">
                  Email Address
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <p className="text-base text-gray-900 break-all">
                    {user.primaryEmailAddress?.emailAddress || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="text-sm font-medium text-gray-500">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-900">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="text-sm font-medium text-gray-500">
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

        {/* File Management Card */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Financial Files</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and switch between your uploaded files
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Active File Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Active File for Analysis
              </label>
              {loadingFiles ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={activeFile?.id || ""}
                  onValueChange={handleFileSelect}
                  disabled={switchingFile}
                >
                  <SelectTrigger className="w-full bg-white border border-gray-200">
                    <SelectValue placeholder="Select a file to analyze">
                      {activeFile && (
                          <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-900">{activeFile.fileName}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {userFiles.map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        <div className="flex items-center space-x-3 py-1">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{file.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.fileSizeMb)} • {formatDate(file.uploadDate)}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {switchingFile && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Switching file...</span>
                </div>
              )}
            </div>

            {/* Current Active File Info */}
            {activeFile && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Currently Active</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{activeFile.fileName}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>{activeFile.fileType.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatDate(activeFile.uploadDate)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* File Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xl font-bold text-gray-900">{userFiles.length}</div>
                <div className="text-sm text-gray-600">Total Files</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xl font-bold text-gray-900">
                  {userFiles.reduce((acc, file) => acc + file.fileSizeMb, 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Total MB</div>
              </div>
            </div>

            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}