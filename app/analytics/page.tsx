import { MainLayout } from "@/components/layout/main-layout"
import AnalyticsContent from "@/components/analytics/analytics-content"
import SubscriptionGuard from "@/components/auth/subscription-guard"

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <AnalyticsContent />
      </SubscriptionGuard>
    </MainLayout>
  )
}
