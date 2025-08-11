import { MainLayout } from "@/components/layout/main-layout"
import UploadContent from "@/components/upload/upload-content"
import SubscriptionGuard from "@/components/auth/subscription-guard"

export default function UploadPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <div className="p-6">
          <UploadContent />
        </div>
      </SubscriptionGuard>
    </MainLayout>
  )
}
