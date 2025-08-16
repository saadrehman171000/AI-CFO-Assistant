import { MainLayout } from "@/components/layout/main-layout";
import SimpleFileUpload from "@/components/upload/simple-file-upload";
import SubscriptionGuard from "@/components/auth/subscription-guard";

export default function UploadPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Upload Financial Document
            </h1>
            <p className="text-muted-foreground mt-2">
              Upload your financial document to analyze on the dashboard
            </p>
          </div>
          <SimpleFileUpload />
        </div>
      </SubscriptionGuard>
    </MainLayout>
  );
}
