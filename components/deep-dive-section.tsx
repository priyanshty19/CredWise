"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileText,
  TrendingUp,
  PieChart,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Download,
  Eye,
  BarChart3,
  Calendar,
  DollarSign,
  Target,
  Zap,
} from "lucide-react"
import { PortfolioAnalysis } from "./portfolio-analysis"

interface SpendingInsight {
  category: string
  amount: number
  percentage: number
  transactions: number
  avgTransaction: number
  trend: "up" | "down" | "stable"
}

interface PortfolioData {
  totalSpending: number
  monthlyAverage: number
  topCategories: SpendingInsight[]
  transactionCount: number
  period: string
  insights: string[]
  recommendations: string[]
}

export default function DeepDiveSection() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsAnalyzing(true)
    setError(null)

    try {
      // Simulate file processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock portfolio analysis data
      const mockData: PortfolioData = {
        totalSpending: 125000,
        monthlyAverage: 25000,
        topCategories: [
          {
            category: "Travel",
            amount: 45000,
            percentage: 36,
            transactions: 12,
            avgTransaction: 3750,
            trend: "up",
          },
          {
            category: "Dining",
            amount: 28000,
            percentage: 22.4,
            transactions: 35,
            avgTransaction: 800,
            trend: "stable",
          },
          {
            category: "Shopping",
            amount: 22000,
            percentage: 17.6,
            transactions: 18,
            avgTransaction: 1222,
            trend: "down",
          },
          {
            category: "Fuel",
            amount: 15000,
            percentage: 12,
            transactions: 24,
            avgTransaction: 625,
            trend: "stable",
          },
          {
            category: "Entertainment",
            amount: 10000,
            percentage: 8,
            transactions: 15,
            avgTransaction: 667,
            trend: "up",
          },
          {
            category: "Utilities",
            amount: 5000,
            percentage: 4,
            transactions: 6,
            avgTransaction: 833,
            trend: "stable",
          },
        ],
        transactionCount: 110,
        period: "Last 5 months",
        insights: [
          "Travel spending is your highest category at 36% of total expenses",
          "You have consistent monthly spending patterns with ₹25,000 average",
          "High-value travel transactions suggest premium travel preferences",
          "Dining expenses show regular frequency with moderate amounts",
          "Fuel spending indicates regular commuting or travel",
        ],
        recommendations: [
          "Consider travel-focused credit cards with airline miles and hotel rewards",
          "Look for cards with dining bonus categories for your frequent restaurant visits",
          "Premium cards with travel insurance and lounge access would suit your profile",
          "Cards with fuel surcharge waivers can save money on your regular fuel expenses",
          "Consider cards with no foreign transaction fees for international travel",
        ],
      }

      setPortfolioData(mockData)
    } catch (err) {
      setError("Failed to analyze the uploaded file. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Deep Dive Portfolio Analysis</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your bank statements or transaction history to get personalized insights and credit card
            recommendations based on your actual spending patterns.
          </p>
        </div>

        {/* Upload Section */}
        {!portfolioData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Your Financial Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isAnalyzing}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer ${isAnalyzing ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className="flex flex-col items-center gap-4">
                    {isAnalyzing ? (
                      <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                    ) : (
                      <FileText className="h-12 w-12 text-gray-400" />
                    )}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {isAnalyzing ? "Analyzing your data..." : "Choose file to upload"}
                      </p>
                      <p className="text-gray-600">
                        {isAnalyzing ? "This may take a few moments" : "Supports PDF, CSV, and Excel files (Max 10MB)"}
                      </p>
                    </div>
                    {uploadedFile && !isAnalyzing && (
                      <Badge variant="outline" className="mt-2">
                        {uploadedFile.name}
                      </Badge>
                    )}
                  </div>
                </label>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Bank statements (PDF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Transaction exports (CSV)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Expense reports (Excel)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button
                onClick={() => {
                  setError(null)
                  setUploadedFile(null)
                  setPortfolioData(null)
                }}
                variant="outline"
                size="sm"
                className="ml-4 bg-transparent"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Portfolio Analysis Results */}
        {portfolioData && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spending</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioData.totalSpending)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{portfolioData.period}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Average</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioData.monthlyAverage)}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Consistent spending pattern</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Transactions</p>
                      <p className="text-2xl font-bold text-gray-900">{portfolioData.transactionCount}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Total transactions analyzed</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Top Category</p>
                      <p className="text-2xl font-bold text-gray-900">{portfolioData.topCategories[0]?.category}</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {portfolioData.topCategories[0]?.percentage}% of spending
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Spending Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Spending Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioData.topCategories.map((category, index) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280"][
                                index
                              ],
                            }}
                          />
                          <span className="font-semibold text-gray-900">{category.category}</span>
                        </div>
                        {getTrendIcon(category.trend)}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(category.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {category.percentage}% • {category.transactions} transactions
                        </p>
                        <p className="text-xs text-gray-500">Avg: {formatCurrency(category.avgTransaction)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {portfolioData.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {portfolioData.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Analysis Component */}
            <PortfolioAnalysis />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="min-w-[200px]">
                <CreditCard className="h-4 w-4 mr-2" />
                Get Personalized Card Recommendations
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px] bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download Analysis Report
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setPortfolioData(null)
                  setUploadedFile(null)
                  setError(null)
                }}
              >
                Upload New File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
