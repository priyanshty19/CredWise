"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  CreditCard,
  DollarSign,
  RefreshCw,
  Loader2,
  Database,
} from "lucide-react"

interface SubmissionData {
  timestamp: string
  creditScore: number
  monthlyIncome: number
  cardType: string
  submissionType: string
}

interface AnalyticsData {
  totalSubmissions: number
  cardTypeDistribution: { name: string; value: number; color: string }[]
  incomeDistribution: { range: string; count: number }[]
  creditScoreDistribution: { range: string; count: number }[]
  submissionTrend: { date: string; count: number }[]
  averageIncome: number
  averageCreditScore: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function SubmissionAnalyticsSheets() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Since we can't access the Google Sheets API directly from the client anymore,
      // we'll show a placeholder message indicating that analytics need to be implemented
      // via a server action or API route

      setError("Analytics data fetching needs to be implemented via server actions for security.")

      // Placeholder data for demonstration
      const mockData: AnalyticsData = {
        totalSubmissions: 0,
        cardTypeDistribution: [
          { name: "Cashback", value: 0, color: COLORS[0] },
          { name: "Travel", value: 0, color: COLORS[1] },
          { name: "Rewards", value: 0, color: COLORS[2] },
          { name: "Student", value: 0, color: COLORS[3] },
          { name: "Business", value: 0, color: COLORS[4] },
        ],
        incomeDistribution: [],
        creditScoreDistribution: [],
        submissionTrend: [],
        averageIncome: 0,
        averageCreditScore: 0,
      }

      setAnalyticsData(mockData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading analytics data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Submission Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="text-yellow-800">
                  <div className="font-medium">Analytics Implementation Required</div>
                  <div className="mt-1">
                    To display submission analytics, you need to implement a server action to securely fetch data from
                    Google Sheets. The Google Sheets API key has been moved to server-side for security.
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="mt-4">
              <Button onClick={fetchAnalyticsData} disabled={isLoading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No analytics data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Submission Analytics</h2>
          <p className="text-gray-600">Overview of credit card recommendation requests</p>
        </div>
        <Button onClick={fetchAnalyticsData} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{analyticsData.totalSubmissions.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Monthly Income</p>
                <p className="text-2xl font-bold">₹{analyticsData.averageIncome.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Credit Score</p>
                <p className="text-2xl font-bold">{analyticsData.averageCreditScore}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Card Types</p>
                <p className="text-2xl font-bold">{analyticsData.cardTypeDistribution.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Card Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.cardTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.cardTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Income Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.incomeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.creditScoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Submission Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.submissionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status */}
      <Card>
        <CardContent className="p-4">
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="text-blue-800">
                Analytics data is now fetched securely from server-side. To implement full analytics, create a server
                action that fetches submission data from Google Sheets.
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
