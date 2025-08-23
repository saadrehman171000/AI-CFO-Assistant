import { MainLayout } from "@/components/layout/main-layout";
import SimpleFileUpload from "@/components/upload/simple-file-upload";
import MultiFileUpload from "@/components/upload/multi-file-upload";
import SubscriptionGuard from "@/components/auth/subscription-guard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Info } from "lucide-react";

export default function UploadPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <div className="space-y-6 p-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Upload Financial Documents
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Upload single or multiple financial documents for AI-powered analysis and chatbot interaction
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">New Feature:</span> Uploaded documents are automatically stored for the AI chatbot, allowing you to ask questions about your financial data!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Options */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="h-5 w-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-gray-900">Choose Upload Method</h2>
              </div>

              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
                  <TabsTrigger value="single">
                    Single File
                  </TabsTrigger>
                  <TabsTrigger value="multiple">
                    Multiple Files
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="space-y-4">
                  <SimpleFileUpload />
                </TabsContent>

                <TabsContent value="multiple" className="space-y-4">
                  <MultiFileUpload />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </SubscriptionGuard>
    </MainLayout>
  );
}
