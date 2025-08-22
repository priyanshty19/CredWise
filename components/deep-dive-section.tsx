"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Upload,
  FileText,
  TrendingUp,
  CreditCard,
  PieChartIcon,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Target,
  Zap,
} from "lucide-react"
import PortfolioDashboard from "./portfolio-dashboard"

interface SpendingData {
  category: string
  amount: number
  percentage: number
  color: string
}

interface MonthlyData {
  month: string
  spending: number
  income: number
}

interface RecommendationInsight {
  title: string
  description: string
  impact: "high" | "medium" | "low"
  actionable: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

// Sample data for demonstration
const sampleSpendingData: SpendingData[] = [
  { category: "Dining", amount: 8500, percentage: 34, color: "#0088FE" },
  { category: "Groceries", amount: 6200, percentage: 25, color: "#00C49F" },
  { category: "Fuel", amount: 4800, percentage: 19, color: "#FFBB28" },
  { category: "Shopping", amount: 3200, percentage: 13, color: "#FF8042" },
  { category: "Entertainment", amount: 2300, percentage: 9, color: "#8884D8" },
]

const sampleMonthlyData: MonthlyData[] = [
  { month: "Jan", spending: 22000, income: 85000 },
  { month: "Feb", spending: 25000, income: 85000 },
  { month: "Mar", spending: 28000, income: 85000 },
  { month: "Apr", spending: 24000, income: 85000 },
  { month: "May", spending: 26000, income: 85000 },
  { month: "Jun", spending: 25000, income: 85000 },
]

const sampleInsights: RecommendationInsight[] = [
  {
    title: "High Dining Spend Opportunity",
    description:
      "34% of your spending is on dining. Consider cards with high dining rewards like HDFC Millennia or SBI SimplyCLICK.",
    impact: "high",
    actionable: true,
  },
  {
    title: "Fuel Spending Optimization",
    description:
      "₹4,800 monthly fuel spend can earn significant rewards with fuel-focused cards like HDFC HPCL or Indian Oil cards.",
    impact: "medium",
    actionable: true,
  },
  {
    title: "Spending Pattern Consistency",
    description:
      "Your spending is consistent month-over-month, making you eligible for premium cards with higher limits.",
    impact: "low",
    actionable: false,
  },
]

export default function DeepDiveSection() {
  const [activeTab, setActiveTab] = useState("upload")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true)

    // Simulate analysis delay
    setTimeout(() => {
      setAnalysisData({
        spendingData: sampleSpendingData,
        monthlyData: sampleMonthlyData,
        insights: sampleInsights,
        totalSpending: 25000,
        avgMonthlySpending: 25000,
        topCategory: "Dining",
        spendingTrend: "stable",
      })
      setIsAnalyzing(false)
      setActiveTab("analysis")
    }, 2000)
  }

  const renderSpendingChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sampleSpendingData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]} />
        <Bar dataKey="amount" fill="#0088FE" />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderSpendingPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={sampleSpendingData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, percentage }) => `${category} ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
        >
          {sampleSpendingData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]} />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderTrendChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={sampleMonthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]} />
        <Line type="monotone" dataKey="spending" stroke="#0088FE" strokeWidth={2} name="Spending" />
        <Line type="monotone" dataKey="income" stroke="#00C49F" strokeWidth={2} name="Income" />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔍 Deep Dive Portfolio Analysis</h1>
        <p className="text-gray-600">Upload your bank statements for personalized insights and card recommendations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Portfolio Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioDashboard
                onAnalysisComplete={(data) => {
                  setAnalysisData(data)
                  setActiveTab("analysis")
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {analysisData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Spending</p>
                        <p className="text-2xl font-bold">₹{analysisData.totalSpending?.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Monthly</p>
                        <p className="text-2xl font-bold">₹{analysisData.avgMonthlySpending?.toLocaleString()}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Top Category</p>
                        <p className="text-2xl font-bold">{analysisData.topCategory}</p>
                      </div>
                      <PieChartIcon className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Trend</p>
                        <p className="text-2xl font-bold capitalize">{analysisData.spendingTrend}</p>
                      </div>
                      <Zap className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>{renderSpendingChart()}</CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>{renderSpendingPieChart()}</CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trend</CardTitle>
                </CardHeader>
                <CardContent>{renderTrendChart()}</CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analysis Data</h3>
                <p className="text-gray-600">Upload your portfolio to see detailed analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {analysisData ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">💡 Personalized Insights</h2>
              {sampleInsights.map((insight, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          insight.impact === "high"
                            ? "bg-red-100"
                            : insight.impact === "medium"
                              ? "bg-yellow-100"
                              : "bg-green-100"
                        }`}
                      >
                        {insight.actionable ? (
                          <Target
                            className={`h-5 w-5 ${
                              insight.impact === "high"
                                ? "text-red-600"
                                : insight.impact === "medium"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          />
                        ) : (
                          <AlertCircle
                            className={`h-5 w-5 ${
                              insight.impact === "high"
                                ? "text-red-600"
                                : insight.impact === "medium"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge
                            variant={
                              insight.impact === "high"
                                ? "destructive"
                                : insight.impact === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {insight.impact} impact
                          </Badge>
                          {insight.actionable && <Badge variant="outline">Actionable</Badge>}
                        </div>
                        <p className="text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
                <p className="text-gray-600">Upload your portfolio to get personalized insights</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {analysisData ? (
            <div className="space-y-6">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Based on your spending analysis, here are the top card recommendations optimized for your spending
                  patterns.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {/* Sample recommendations based on analysis */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">#1</Badge>
                          <h3 className="text-xl font-bold">HDFC Millennia Credit Card</h3>
                          <Badge variant="outline">HDFC</Badge>
                        </div>
                        <p className="text-gray-600">Perfect for your high dining and online spending</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">92.5</div>
                        <div className="text-sm text-gray-500">Match Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="font-bold text-green-600">5%</div>
                        <div className="text-sm text-gray-500">Dining Rewards</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">₹1,000</div>
                        <div className="text-sm text-gray-500">Joining Fee</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">₹1,000</div>
                        <div className="text-sm text-gray-500">Annual Fee</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-orange-600">₹2,000</div>
                        <div className="text-sm text-gray-500">Welcome Bonus</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="default">Dining</Badge>
                      <Badge variant="default">Online Shopping</Badge>
                      <Badge variant="secondary">Groceries</Badge>
                    </div>

                    <Button className="w-full">Apply Now - Estimated Monthly Savings: ₹850</Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">#2</Badge>
                          <h3 className="text-xl font-bold">SBI SimplyCLICK Credit Card</h3>
                          <Badge variant="outline">SBI</Badge>
                        </div>
                        <p className="text-gray-600">Great for online spending and fuel</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">88.2</div>
                        <div className="text-sm text-gray-500">Match Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="font-bold text-green-600">10X</div>
                        <div className="text-sm text-gray-500">Online Rewards</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">₹499</div>
                        <div className="text-sm text-gray-500">Joining Fee</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">₹499</div>
                        <div className="text-sm text-gray-500">Annual Fee</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-orange-600">₹500</div>
                        <div className="text-sm text-gray-500">Welcome Bonus</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="default">Online Shopping</Badge>
                      <Badge variant="default">Fuel</Badge>
                      <Badge variant="secondary">Entertainment</Badge>
                    </div>

                    <Button className="w-full">Apply Now - Estimated Monthly Savings: ₹720</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
                <p className="text-gray-600">Upload your portfolio to get personalized card recommendations</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
