import { MainLayout } from "@/components/layout/main-layout"
import UploadContent from "@/components/upload/upload-content"

export default function UploadPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <UploadContent />
      </div>
    </MainLayout>
  )
}
