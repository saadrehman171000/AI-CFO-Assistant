import { MainLayout } from "@/components/layout/main-layout"
import { UserProfile } from "@/components/auth/user-profile"

export default function ProfilePage() {
  return (
    <MainLayout>
      <UserProfile />
    </MainLayout>
  )
}
