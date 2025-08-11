import { MainLayout } from "@/components/layout/main-layout"
import ForecastingContent from "@/components/forecasting/forecasting-content"

export default function ForecastingPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <ForecastingContent />
      </div>
    </MainLayout>
  )
}
