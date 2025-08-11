import { SignUp } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"

export default function SignUpPage() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <SignUp
            path="/sign-up"
            redirectUrl="/dashboard"
            routing="path"
            appearance={{
              elements: {
                formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                rootBox: "mx-auto",
                card: "shadow-xl border-0",
                headerTitle: "text-2xl font-bold text-gray-900",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                dividerLine: "bg-gray-300",
                dividerText: "text-gray-500",
                formFieldLabel: "text-gray-700 font-medium",
                formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
          />
        </div>
      </div>
    </MainLayout>
  )
}
