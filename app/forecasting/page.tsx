import { MainLayout } from "@/components/layout/main-layout"
import ForecastingContent from "@/components/forecasting/forecasting-content"
import SubscriptionGuard from "@/components/auth/subscription-guard"

export default function ForecastingPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <div className="p-6">
          <ForecastingContent />
        </div>
      </SubscriptionGuard>
    </MainLayout>
  )
}
