"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Target, AlertTriangle } from "lucide-react"

interface PortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "other"
  amount: number
  units?: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  source: "upload" | "manual"
  fileName?: string
}

interface PortfolioDashboardProps {
  portfolioEntries: PortfolioEntry[]
}

export default function PortfolioDashboard({ portfolioEntries }: PortfolioDashboardProps) {
  // Calculate portfolio metrics
  const totalInvested = portfolioEntries.reduce((sum, entry) => sum + entry.amount, 0)
  const totalCurrentValue = portfolioEntries.reduce((sum, entry) => sum + entry.currentValue, 0)
  const totalGainLoss = totalCurrentValue - totalInvested
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  // Asset allocation
  const assetAllocation = portfolioEntries.reduce(
    (acc, entry) => {
      const type = entry.type
      if (!acc[type]) {
        acc[type] = { count: 0, value: 0, invested: 0 }
      }
      acc[type].count += 1
      acc[type].value += entry.currentValue
      acc[type].invested += entry.amount
      return acc
    },
    {} as Record<string, { count: number; value: number; invested: number }>,
  )

  // Top performers
  const topPerformers = [...portfolioEntries].sort((a, b) => b.gainLossPercentage - a.gainLossPercentage).slice(0, 5)

  // Bottom performers
  const bottomPerformers = [...portfolioEntries].sort((a, b) => a.gainLossPercentage - b.gainLossPercentage).slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case "mutual_fund":
        return "Mutual Funds"
      case "stock":
        return "Stocks"
      case "bond":
        return "Bonds"
      default:
        return "Other"
    }
  }

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case "mutual_fund":
        return "bg-blue-100 text-blue-800"
      case "stock":
        return "bg-green-100 text-green-800"
      case "bond":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCurrentValue)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalGainLoss >= 0 ? "+" : ""}
                  {formatCurrency(totalGainLoss)}
                </p>
              </div>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Return %</p>
                <p className={`text-2xl font-bold ${totalGainLossPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalGainLossPercentage >= 0 ? "+" : ""}
                  {totalGainLossPercentage.toFixed(2)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(assetAllocation).map(([type, data]) => {
              const percentage = (data.value / totalCurrentValue) * 100
              return (
                <div key={type} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getAssetTypeColor(type)}>{getAssetTypeLabel(type)}</Badge>
                    <span className="text-sm text-gray-600">{data.count} items</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{formatCurrency(data.value)}</p>
                    <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of portfolio</p>
                    <p className={`text-sm ${data.value >= data.invested ? "text-green-600" : "text-red-600"}`}>
                      {data.value >= data.invested ? "+" : ""}
                      {formatCurrency(data.value - data.invested)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(entry.amount)} → {formatCurrency(entry.currentValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{entry.gainLossPercentage.toFixed(2)}%</p>
                    <p className="text-sm text-green-600">+{formatCurrency(entry.gainLoss)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottomPerformers.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(entry.amount)} → {formatCurrency(entry.currentValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{entry.gainLossPercentage.toFixed(2)}%</p>
                    <p className="text-sm text-red-600">{formatCurrency(entry.gainLoss)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{portfolioEntries.length}</p>
                <p className="text-sm text-blue-800">Total Investments</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {portfolioEntries.filter((e) => e.gainLoss > 0).length}
                </p>
                <p className="text-sm text-green-800">Profitable Investments</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {portfolioEntries.filter((e) => e.gainLoss < 0).length}
                </p>
                <p className="text-sm text-red-800">Loss-making Investments</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Portfolio Insights</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>
                      • Your portfolio has a {totalGainLossPercentage >= 0 ? "positive" : "negative"} return of{" "}
                      {totalGainLossPercentage.toFixed(2)}%
                    </li>
                    <li>• Consider rebalancing if any asset class exceeds 60% of your portfolio</li>
                    <li>• Review underperforming investments for potential reallocation</li>
                    <li>• Diversification across asset classes can help reduce risk</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
