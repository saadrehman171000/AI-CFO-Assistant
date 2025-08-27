import { Suspense } from 'react'
import BranchComparison from '@/components/company/branch-comparison'
import { MainLayout } from '@/components/layout/main-layout'
import CompanyGuard from '@/components/auth/company-guard'
import SubscriptionGuard from '@/components/auth/subscription-guard'

export default function ComparisonPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <CompanyGuard>
          <div className="p-6">
            <Suspense fallback={<div>Loading comparison data...</div>}>
              <BranchComparison />
            </Suspense>
          </div>
        </CompanyGuard>
      </SubscriptionGuard>
    </MainLayout>
  )
}