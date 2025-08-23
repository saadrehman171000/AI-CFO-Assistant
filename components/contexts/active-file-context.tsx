"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ActiveFileInfo {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
}

interface ActiveFileContextType {
  activeFile: ActiveFileInfo | null;
  activeFileData: any | null;
  setActiveFile: (fileId: string) => Promise<void>;
  refreshActiveFile: () => Promise<void>;
  loading: boolean;
}

const ActiveFileContext = createContext<ActiveFileContextType | undefined>(undefined);

export function ActiveFileProvider({ children }: { children: ReactNode }) {
  const [activeFile, setActiveFileState] = useState<ActiveFileInfo | null>(null);
  const [activeFileData, setActiveFileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const setActiveFile = async (fileId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/set-active-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setActiveFileState(result.fileInfo);
          setActiveFileData(result.data);
          // Store in localStorage for persistence
          localStorage.setItem("activeFileId", fileId);
        }
      } else {
        console.error("Failed to set active file");
      }
    } catch (error) {
      console.error("Error setting active file:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveFile = async () => {
    // Try to get the latest analysis data if no active file is set
    setLoading(true);
    try {
      const response = await fetch("/api/financial-analysis?latest=true");
      if (response.ok) {
        const data = await response.json();
        if (data && data.file_info) {
          setActiveFileData(data);
          setActiveFileState({
            id: "latest",
            fileName: data.file_info.filename,
            fileType: data.file_info.file_type,
            uploadDate: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing active file:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize with stored active file or latest
  useEffect(() => {
    const storedFileId = localStorage.getItem("activeFileId");
    if (storedFileId && storedFileId !== "latest") {
      setActiveFile(storedFileId);
    } else {
      refreshActiveFile();
    }
  }, []);

  return (
    <ActiveFileContext.Provider
      value={{
        activeFile,
        activeFileData,
        setActiveFile,
        refreshActiveFile,
        loading,
      }}
    >
      {children}
    </ActiveFileContext.Provider>
  );
}

export function useActiveFile() {
  const context = useContext(ActiveFileContext);
  if (context === undefined) {
    throw new Error("useActiveFile must be used within an ActiveFileProvider");
  }
  return context;
}
