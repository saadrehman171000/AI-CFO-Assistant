import { MainLayout } from "@/components/layout/main-layout"
import DashboardContent from '@/components/dashboard/dashboard-content'
import SubscriptionGuard from '@/components/auth/subscription-guard'

export default function DashboardPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <div className="p-6">
          <DashboardContent />
        </div>
      </SubscriptionGuard>
    </MainLayout>
  )
}
