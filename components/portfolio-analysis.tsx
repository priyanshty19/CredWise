"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Calendar,
  Building2,
  CreditCard,
  Loader2,
} from "lucide-react"
import { parseUniversalStatement } from "@/lib/universal-statement-parser"

interface Transaction {
  date: string
  description: string
  amount: number
  category?: string
  type: "debit" | "credit"
}

interface AnalysisResult {
  totalTransactions: number
  totalSpending: number
  totalCredits: number
  netAmount: number
  categories: Record<string, { amount: number; count: number }>
  monthlyBreakdown: Record<string, number>
  topMerchants: Array<{ name: string; amount: number; count: number }>
  insights: string[]
}

export function PortfolioAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setAnalysisResult(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file to analyze")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      console.log("🔍 Starting portfolio analysis for:", file.name)

      // Parse the statement file
      const transactions = await parseUniversalStatement(file)

      if (!transactions || transactions.length === 0) {
        throw new Error("No transactions found in the file. Please check the file format.")
      }

      console.log(`📊 Parsed ${transactions.length} transactions`)

      // Perform analysis
      const analysis = analyzeTransactions(transactions)
      setAnalysisResult(analysis)

      console.log("✅ Analysis completed successfully")
    } catch (err) {
      console.error("❌ Analysis error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze the file")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeTransactions = (transactions: Transaction[]): AnalysisResult => {
    const categories: Record<string, { amount: number; count: number }> = {}
    const monthlyBreakdown: Record<string, number> = {}
    const merchantMap: Record<string, { amount: number; count: number }> = {}

    let totalSpending = 0
    let totalCredits = 0

    transactions.forEach((transaction) => {
      const { amount, type, description, date } = transaction
      const month = new Date(date).toISOString().slice(0, 7) // YYYY-MM format

      if (type === "debit") {
        totalSpending += Math.abs(amount)

        // Category analysis
        const category = transaction.category || categorizeTransaction(description)
        if (!categories[category]) {
          categories[category] = { amount: 0, count: 0 }
        }
        categories[category].amount += Math.abs(amount)
        categories[category].count += 1

        // Monthly breakdown
        if (!monthlyBreakdown[month]) {
          monthlyBreakdown[month] = 0
        }
        monthlyBreakdown[month] += Math.abs(amount)

        // Merchant analysis
        const merchant = extractMerchantName(description)
        if (!merchantMap[merchant]) {
          merchantMap[merchant] = { amount: 0, count: 0 }
        }
        merchantMap[merchant].amount += Math.abs(amount)
        merchantMap[merchant].count += 1
      } else {
        totalCredits += Math.abs(amount)
      }
    })

    // Get top merchants
    const topMerchants = Object.entries(merchantMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    // Generate insights
    const insights = generateInsights(categories, monthlyBreakdown, totalSpending, transactions.length)

    return {
      totalTransactions: transactions.length,
      totalSpending,
      totalCredits,
      netAmount: totalCredits - totalSpending,
      categories,
      monthlyBreakdown,
      topMerchants,
      insights,
    }
  }

  const categorizeTransaction = (description: string): string => {
    const desc = description.toLowerCase()

    if (
      desc.includes("restaurant") ||
      desc.includes("food") ||
      desc.includes("dining") ||
      desc.includes("zomato") ||
      desc.includes("swiggy")
    ) {
      return "Dining & Restaurants"
    }
    if (
      desc.includes("fuel") ||
      desc.includes("petrol") ||
      desc.includes("gas") ||
      desc.includes("hp") ||
      desc.includes("iocl")
    ) {
      return "Fuel & Gas"
    }
    if (
      desc.includes("grocery") ||
      desc.includes("supermarket") ||
      desc.includes("bigbasket") ||
      desc.includes("grofers")
    ) {
      return "Groceries"
    }
    if (desc.includes("amazon") || desc.includes("flipkart") || desc.includes("shopping") || desc.includes("mall")) {
      return "Online Shopping"
    }
    if (
      desc.includes("uber") ||
      desc.includes("ola") ||
      desc.includes("taxi") ||
      desc.includes("metro") ||
      desc.includes("transport")
    ) {
      return "Transport"
    }
    if (
      desc.includes("movie") ||
      desc.includes("cinema") ||
      desc.includes("netflix") ||
      desc.includes("entertainment")
    ) {
      return "Entertainment"
    }
    if (
      desc.includes("electricity") ||
      desc.includes("water") ||
      desc.includes("internet") ||
      desc.includes("mobile") ||
      desc.includes("utility")
    ) {
      return "Utilities & Bills"
    }
    if (desc.includes("hotel") || desc.includes("flight") || desc.includes("travel") || desc.includes("booking")) {
      return "Travel & Hotels"
    }
    if (desc.includes("medical") || desc.includes("hospital") || desc.includes("pharmacy") || desc.includes("health")) {
      return "Healthcare"
    }

    return "Others"
  }

  const extractMerchantName = (description: string): string => {
    // Simple merchant name extraction - can be enhanced
    const parts = description.split(" ")
    return (
      parts
        .slice(0, 2)
        .join(" ")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim() || "Unknown"
    )
  }

  const generateInsights = (
    categories: Record<string, { amount: number; count: number }>,
    monthlyBreakdown: Record<string, number>,
    totalSpending: number,
    transactionCount: number,
  ): string[] => {
    const insights: string[] = []

    // Top spending category
    const topCategory = Object.entries(categories).sort(([, a], [, b]) => b.amount - a.amount)[0]

    if (topCategory) {
      const percentage = ((topCategory[1].amount / totalSpending) * 100).toFixed(1)
      insights.push(`Your highest spending category is ${topCategory[0]} (${percentage}% of total spending)`)
    }

    // Average transaction amount
    const avgTransaction = totalSpending / transactionCount
    insights.push(`Your average transaction amount is ₹${avgTransaction.toFixed(0)}`)

    // Monthly spending pattern
    const months = Object.keys(monthlyBreakdown).sort()
    if (months.length >= 2) {
      const latestMonth = monthlyBreakdown[months[months.length - 1]]
      const previousMonth = monthlyBreakdown[months[months.length - 2]]
      const change = (((latestMonth - previousMonth) / previousMonth) * 100).toFixed(1)

      if (Number.parseFloat(change) > 0) {
        insights.push(`Your spending increased by ${change}% compared to the previous month`)
      } else {
        insights.push(
          `Your spending decreased by ${Math.abs(Number.parseFloat(change))}% compared to the previous month`,
        )
      }
    }

    // High-frequency categories
    const highFreqCategory = Object.entries(categories).sort(([, a], [, b]) => b.count - a.count)[0]

    if (highFreqCategory && highFreqCategory[1].count > 5) {
      insights.push(
        `You make frequent transactions in ${highFreqCategory[0]} (${highFreqCategory[1].count} transactions)`,
      )
    }

    return insights
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Portfolio Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="statement-file">Upload Bank Statement or Credit Card Statement</Label>
            <div className="mt-2">
              <Input
                id="statement-file"
                type="file"
                accept=".pdf,.csv,.xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="cursor-pointer"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, CSV, Excel (.xlsx, .xls)</p>
          </div>

          {file && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Selected file: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleAnalyze} disabled={!file || isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Analyze Portfolio
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold">{analysisResult.totalTransactions}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Spending</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(analysisResult.totalSpending)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Credits</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(analysisResult.totalCredits)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Net Amount</p>
                    <p
                      className={`text-2xl font-bold ${analysisResult.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(analysisResult.netAmount)}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spending Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analysisResult.categories)
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .map(([category, data]) => {
                    const percentage = ((data.amount / analysisResult.totalSpending) * 100).toFixed(1)
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{category}</Badge>
                          <span className="text-sm text-gray-600">{data.count} transactions</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(data.amount)}</div>
                          <div className="text-sm text-gray-500">{percentage}%</div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Spending Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analysisResult.monthlyBreakdown)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, amount]) => (
                    <div key={month} className="flex justify-between items-center">
                      <span className="font-medium">
                        {new Date(month + "-01").toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                      </span>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Merchants */}
          <Card>
            <CardHeader>
              <CardTitle>Top Merchants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.topMerchants.slice(0, 10).map((merchant, index) => (
                  <div key={merchant.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <span className="font-medium">{merchant.name}</span>
                      <span className="text-sm text-gray-600">{merchant.count} transactions</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(merchant.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.insights.map((insight, index) => (
                  <Alert key={index}>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{insight}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PortfolioAnalysis
