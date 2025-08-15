"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, CreditCard, DollarSign, Database } from "lucide-react"
import { getSubmissionAnalytics } from "@/lib/google-sheets-submissions"

interface AnalyticsData {
  totalSubmissions: number
  avgCreditScore: number
  avgIncome: number
  cardTypeDistribution: { name: string; value: number; color: string }[]
  recentSubmissions: any[]
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export default function SubmissionAnalyticsSheets() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getSubmissionAnalytics()

        // Process card type distribution for chart
        const cardTypeDistribution = Object.entries(data.cardTypeDistribution).map(([name, value], index) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: value as number,
          color: COLORS[index % COLORS.length],
        }))

        setAnalytics({
          totalSubmissions: data.totalSubmissions,
          avgCreditScore: data.avgCreditScore,
          avgIncome: data.avgIncome,
          cardTypeDistribution,
          recentSubmissions: data.recentSubmissions,
        })
      } catch (err: any) {
        console.error("Error fetching analytics:", err)
        setError(err.message || "Failed to fetch analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <Database className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Analytics Error</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Submission Analytics</h2>
        <div className="flex items-center text-sm text-green-600">
          <Database className="h-4 w-4 mr-1" />
          Powered by Google Sheets
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Credit Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgCreditScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Income</p>
                <p className="text-2xl font-bold text-gray-900">₹{(analytics.avgIncome / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Card Types</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.cardTypeDistribution.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card Type Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.cardTypeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.cardTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.cardTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentSubmissions.length > 0 ? (
                analytics.recentSubmissions.map((submission, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {submission.cardType?.charAt(0).toUpperCase() + submission.cardType?.slice(1) || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Score: {submission.creditScore} | Income: ₹{(submission.monthlyIncome / 100000).toFixed(1)}L
                      </p>
                      {submission.submissionType && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            submission.submissionType === "enhanced"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {submission.submissionType}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {submission.timestamp ? new Date(submission.timestamp).toLocaleDateString() : "Unknown"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">No recent submissions</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
