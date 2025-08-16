import Navigation from "@/components/navigation"
import SubmissionAnalyticsSheets from "@/components/submission-analytics-sheets"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">Analytics and insights from form submissions</p>
        </div>

        <SubmissionAnalyticsSheets />
      </main>
    </div>
  )
}
