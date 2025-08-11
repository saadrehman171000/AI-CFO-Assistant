import { MainLayout } from "@/components/layout/main-layout"
import DashboardContent from '@/components/dashboard/dashboard-content'

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <DashboardContent />
      </div>
    </MainLayout>
  )
}
