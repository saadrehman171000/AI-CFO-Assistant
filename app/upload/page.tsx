import { MainLayout } from "@/components/layout/main-layout";
import SimpleFileUpload from "@/components/upload/simple-file-upload";
import MultiFileUpload from "@/components/upload/multi-file-upload";
import SubscriptionGuard from "@/components/auth/subscription-guard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UploadPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <div className="p-3 sm:p-4 md:p-6">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Upload Financial Documents
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1 sm:mt-2">
              Upload single or multiple financial documents for AI-powered
              analysis
            </p>
          </div>

          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto grid-cols-2 mb-4 sm:mb-6 md:mb-8">
              <TabsTrigger
                value="single"
                className="text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3"
              >
                Single File
              </TabsTrigger>
              <TabsTrigger
                value="multiple"
                className="text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-3"
              >
                Multiple Files
              </TabsTrigger>
            </TabsList>
            <TabsContent value="single">
              <SimpleFileUpload />
            </TabsContent>
            <TabsContent value="multiple">
              <MultiFileUpload />
            </TabsContent>
          </Tabs>
        </div>
      </SubscriptionGuard>
    </MainLayout>
  );
}
