"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { TrendingUp, Users, DollarSign, CreditCard, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAnalytics } from "@/app/actions/google-sheets"

interface SubmissionData {
  timestamp: string
  monthlyIncome: string
  spendingCategories: string
  monthlySpending: string
  currentCards: string
  creditScore: string
  preferredBanks: string
  joiningFeePreference: string
}

interface AnalyticsData {
  totalSubmissions: number
  avgIncome: number
  avgSpending: number
  avgCreditScore: number
  topCategories: Array<{ name: string; count: number }>
  topBanks: Array<{ name: string; count: number }>
  incomeDistribution: Array<{ range: string; count: number }>
  submissionTrend: Array<{ date: string; count: number }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function SubmissionAnalyticsSheets() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const analyticsResult = await getAnalytics()

      if (!analyticsResult.success) {
        throw new Error(analyticsResult.error || "Failed to fetch analytics")
      }

      const analytics = analyticsResult.data

      setData(analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics")
      // Set demo data for development
      setData(getDemoAnalytics())
    } finally {
      setLoading(false)
    }
  }

  const processAnalytics = (submissions: SubmissionData[]): AnalyticsData => {
    const totalSubmissions = submissions.length

    // Calculate averages
    const incomes = submissions.map((s) => Number.parseInt(s.monthlyIncome) || 0).filter((i) => i > 0)
    const spendings = submissions.map((s) => Number.parseInt(s.monthlySpending) || 0).filter((s) => s > 0)
    const creditScores = submissions.map((s) => Number.parseInt(s.creditScore) || 0).filter((c) => c > 0)

    const avgIncome = incomes.length > 0 ? incomes.reduce((a, b) => a + b, 0) / incomes.length : 0
    const avgSpending = spendings.length > 0 ? spendings.reduce((a, b) => a + b, 0) / spendings.length : 0
    const avgCreditScore = creditScores.length > 0 ? creditScores.reduce((a, b) => a + b, 0) / creditScores.length : 0

    // Top spending categories
    const categoryCount: Record<string, number> = {}
    submissions.forEach((s) => {
      if (s.spendingCategories) {
        s.spendingCategories.split(",").forEach((cat) => {
          const category = cat.trim()
          categoryCount[category] = (categoryCount[category] || 0) + 1
        })
      }
    })

    const topCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Top preferred banks
    const bankCount: Record<string, number> = {}
    submissions.forEach((s) => {
      if (s.preferredBanks) {
        s.preferredBanks.split(",").forEach((bank) => {
          const bankName = bank.trim()
          bankCount[bankName] = (bankCount[bankName] || 0) + 1
        })
      }
    })

    const topBanks = Object.entries(bankCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Income distribution
    const incomeRanges = [
      { range: "< 25K", min: 0, max: 25000 },
      { range: "25K-50K", min: 25000, max: 50000 },
      { range: "50K-75K", min: 50000, max: 75000 },
      { range: "75K-100K", min: 75000, max: 100000 },
      { range: "100K+", min: 100000, max: Number.POSITIVE_INFINITY },
    ]

    const incomeDistribution = incomeRanges.map((range) => ({
      range: range.range,
      count: incomes.filter((income) => income >= range.min && income < range.max).length,
    }))

    // Submission trend (last 7 days)
    const submissionTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString(),
        count: Math.floor(Math.random() * 10) + 1, // Mock data
      }
    })

    return {
      totalSubmissions,
      avgIncome,
      avgSpending,
      avgCreditScore,
      topCategories,
      topBanks,
      incomeDistribution,
      submissionTrend,
    }
  }

  const getDemoAnalytics = (): AnalyticsData => ({
    totalSubmissions: 156,
    avgIncome: 65000,
    avgSpending: 25000,
    avgCreditScore: 742,
    topCategories: [
      { name: "Dining", count: 89 },
      { name: "Shopping", count: 76 },
      { name: "Travel", count: 54 },
      { name: "Fuel", count: 43 },
      { name: "Groceries", count: 38 },
      { name: "Entertainment", count: 29 },
    ],
    topBanks: [
      { name: "HDFC Bank", count: 45 },
      { name: "ICICI Bank", count: 38 },
      { name: "SBI", count: 32 },
      { name: "Axis Bank", count: 28 },
      { name: "Kotak Mahindra", count: 21 },
    ],
    incomeDistribution: [
      { range: "< 25K", count: 12 },
      { range: "25K-50K", count: 34 },
      { range: "50K-75K", count: 56 },
      { range: "75K-100K", count: 38 },
      { range: "100K+", count: 16 },
    ],
    submissionTrend: [
      { date: "Dec 10", count: 8 },
      { date: "Dec 11", count: 12 },
      { date: "Dec 12", count: 15 },
      { date: "Dec 13", count: 9 },
      { date: "Dec 14", count: 18 },
      { date: "Dec 15", count: 22 },
      { date: "Dec 16", count: 16 },
    ],
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !data) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
          <Button onClick={fetchAnalytics} variant="outline" size="sm" className="ml-4 bg-transparent">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Form Submission Analytics</h2>
          <p className="text-gray-600">Real-time insights from user submissions</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">Using demo data due to API error: {error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Form submissions received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.avgIncome)}</div>
            <p className="text-xs text-muted-foreground">Average user income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.avgSpending)}</div>
            <p className="text-xs text-muted-foreground">Average user spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Credit Score</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.avgCreditScore)}</div>
            <p className="text-xs text-muted-foreground">Average credit score</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Income Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Income Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.incomeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.incomeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Preferred Banks */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Banks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topBanks.map((bank, index) => (
                <div key={bank.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{bank.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(bank.count / data.totalSubmissions) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{bank.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submission Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.submissionTrend}>
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
    </div>
  )
}
