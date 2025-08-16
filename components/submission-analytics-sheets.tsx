"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Download,
  Calendar,
  CreditCard,
  Building2,
} from "lucide-react"

interface SubmissionData {
  timestamp: string
  monthlyIncome: number
  spendingCategories: string[]
  preferredBanks: string[]
  maxAnnualFee: number
  cardType: string
  topRecommendation: string
  totalRecommendations: number
}

interface AnalyticsData {
  totalSubmissions: number
  avgIncome: number
  popularCategories: { [key: string]: number }
  popularBanks: { [key: string]: number }
  cardTypeDistribution: { [key: string]: number }
  feePreferences: { [key: string]: number }
  topRecommendedCards: { [key: string]: number }
  submissionsByDate: { [key: string]: number }
}

export default function SubmissionAnalyticsSheets() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // This would fetch from your Google Sheets submissions
      // For now, we'll use mock data
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      const mockData: AnalyticsData = {
        totalSubmissions: 156,
        avgIncome: 75000,
        popularCategories: {
          "Online Shopping": 89,
          Dining: 67,
          Travel: 45,
          Groceries: 34,
          Fuel: 23,
        },
        popularBanks: {
          "HDFC Bank": 45,
          "ICICI Bank": 38,
          SBI: 32,
          "Axis Bank": 25,
          "Any Bank": 16,
        },
        cardTypeDistribution: {
          Cashback: 56,
          Rewards: 42,
          Travel: 28,
          Premium: 18,
          Any: 12,
        },
        feePreferences: {
          "₹0": 67,
          "₹1,000": 34,
          "₹2,500": 28,
          "₹5,000": 18,
          "₹10,000+": 9,
        },
        topRecommendedCards: {
          "SBI Cashback Card": 34,
          "HDFC Regalia Gold": 28,
          "ICICI Amazon Pay": 25,
          "Axis Ace Credit Card": 22,
          "HDFC Millennia": 19,
        },
        submissionsByDate: {
          "2024-01-15": 12,
          "2024-01-16": 8,
          "2024-01-17": 15,
          "2024-01-18": 11,
          "2024-01-19": 9,
          "2024-01-20": 14,
          "2024-01-21": 7,
        },
      }

      setData(mockData)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics")
    } finally {
      setIsLoading(false)
    }
  }

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

  if (!data && !isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Analytics Data</h3>
          <p className="text-gray-500 text-center mb-4">Click the button below to load submission analytics</p>
          <Button onClick={fetchAnalytics}>Load Analytics</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submission Analytics</h2>
          {lastUpdated && <p className="text-sm text-gray-600">Last updated: {lastUpdated.toLocaleString()}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalSubmissions}</div>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.avgIncome)}</div>
                <p className="text-xs text-muted-foreground">Monthly average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(data.popularCategories)[0]}</div>
                <p className="text-xs text-muted-foreground">{Object.values(data.popularCategories)[0]} selections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Recommended</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{Object.keys(data.topRecommendedCards)[0]}</div>
                <p className="text-xs text-muted-foreground">
                  {Object.values(data.topRecommendedCards)[0]} recommendations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="banks">Banks</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Spending Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data.popularCategories).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="font-medium">{category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / data.totalSubmissions) * 100}%` }}
                            ></div>
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="banks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Bank Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data.popularBanks).map(([bank, count]) => (
                      <div key={bank} className="flex items-center justify-between">
                        <span className="font-medium">{bank}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(count / data.totalSubmissions) * 100}%` }}
                            ></div>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Most Recommended Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data.topRecommendedCards).map(([card, count]) => (
                      <div key={card} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{card}</div>
                          <div className="text-sm text-gray-600">
                            {((count / data.totalSubmissions) * 100).toFixed(1)}% of recommendations
                          </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Fee Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data.feePreferences).map(([fee, count]) => (
                      <div key={fee} className="flex items-center justify-between">
                        <span className="font-medium">Up to {fee}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${(count / data.totalSubmissions) * 100}%` }}
                            ></div>
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Daily Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(data.submissionsByDate).map(([date, count]) => (
                      <div key={date} className="flex items-center justify-between">
                        <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(data.submissionsByDate))) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
