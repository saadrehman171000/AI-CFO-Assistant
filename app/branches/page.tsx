import { Suspense } from 'react'
import BranchManager from '@/components/company/branch-manager'
import { MainLayout } from '@/components/layout/main-layout'
import CompanyGuard from '@/components/auth/company-guard'
import SubscriptionGuard from '@/components/auth/subscription-guard'

export default function BranchesPage() {
  return (
    <MainLayout>
      <SubscriptionGuard>
        <CompanyGuard>
          <div className="p-6">
            <Suspense fallback={<div>Loading branches...</div>}>
              <BranchManager />
            </Suspense>
          </div>
        </CompanyGuard>
      </SubscriptionGuard>
    </MainLayout>
  )
}

