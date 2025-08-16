import SubmissionAnalyticsSheets from "@/components/submission-analytics-sheets"

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor credit card recommendation submissions and user analytics</p>
      </div>

      <SubmissionAnalyticsSheets />
    </div>
  )
}
