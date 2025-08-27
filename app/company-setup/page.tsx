import { Suspense } from 'react'
import CompanySetupWizard from '@/components/company/company-setup-wizard'
import { MainLayout } from '@/components/layout/main-layout'

export default function CompanySetupPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to AI CFO Pro!</h1>
            <p className="text-gray-600 mt-2">
              Let's set up your company profile and branches to get started
            </p>
          </div>
          
          <Suspense fallback={<div>Loading setup wizard...</div>}>
            <CompanySetupWizard />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  )
}

