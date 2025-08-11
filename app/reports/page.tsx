import { MainLayout } from "@/components/layout/main-layout"
import { ReportsContent } from "@/components/reports/reports-content"
import SubscriptionGuard from "@/components/auth/subscription-guard"

export default function ReportsPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <ReportsContent />
      </SubscriptionGuard>
    </MainLayout>
  )
}
