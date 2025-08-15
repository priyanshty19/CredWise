import Navigation from "@/components/navigation"
import SubmissionAnalyticsSheets from "@/components/submission-analytics-sheets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="HOME" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CredWise Analytics Dashboard</h1>
          <p className="text-gray-600">
            Monitor credit card recommendation submissions and user preferences from Google Sheets
          </p>
        </div>

        <SubmissionAnalyticsSheets />

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-sm text-green-800">Google Sheets Connected</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">⚡</div>
                <p className="text-sm text-blue-800">Recommendation Engine Active</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">📊</div>
                <p className="text-sm text-purple-800">Analytics Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
