"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertTriangle,
} from "lucide-react"

interface PortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "etf"
  invested: number
  current: number
  units: number
  nav: number
  date: string
  source: "upload" | "manual"
  fileName?: string
}

interface PortfolioDashboardProps {
  entries: PortfolioEntry[]
}

export default function PortfolioDashboard({ entries }: PortfolioDashboardProps) {
  console.log("📊 Dashboard rendering with entries:", entries.length)

  // Calculate portfolio metrics
  const totalInvested = entries.reduce((sum, entry) => sum + entry.invested, 0)
  const totalCurrent = entries.reduce((sum, entry) => sum + entry.current, 0)
  const totalGainLoss = totalCurrent - totalInvested
  const totalReturnPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  // Asset allocation
  const assetAllocation = entries.reduce(
    (acc, entry) => {
      const type = entry.type
      if (!acc[type]) {
        acc[type] = { invested: 0, current: 0, count: 0 }
      }
      acc[type].invested += entry.invested
      acc[type].current += entry.current
      acc[type].count += 1
      return acc
    },
    {} as Record<string, { invested: number; current: number; count: number }>,
  )

  // Performance analysis
  const performanceEntries = entries
    .map((entry) => ({
      ...entry,
      gainLoss: entry.current - entry.invested,
      returnPercentage: entry.invested > 0 ? ((entry.current - entry.invested) / entry.invested) * 100 : 0,
    }))
    .sort((a, b) => b.returnPercentage - a.returnPercentage)

  const topPerformers = performanceEntries.slice(0, 5)
  const underPerformers = performanceEntries.slice(-5).reverse()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      mutual_fund: "Mutual Fund",
      stock: "Stock",
      bond: "Bond",
      etf: "ETF",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      mutual_fund: "bg-blue-500",
      stock: "bg-green-500",
      bond: "bg-yellow-500",
      etf: "bg-purple-500",
    }
    return colors[type as keyof typeof colors] || "bg-gray-500"
  }

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      mutual_fund: "bg-blue-100 text-blue-800",
      stock: "bg-green-100 text-green-800",
      bond: "bg-yellow-100 text-yellow-800",
      etf: "bg-purple-100 text-purple-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        Debug: Showing {entries.length} portfolio entries
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
                <p className="text-xs text-gray-500 mt-1">{entries.length} investments</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCurrent)}</p>
                <p className="text-xs text-gray-500 mt-1">Portfolio value</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(totalGainLoss)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Absolute change</p>
              </div>
              <div className={`p-2 rounded-full ${totalGainLoss >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                {totalGainLoss >= 0 ? (
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Return</p>
                <p className={`text-2xl font-bold ${totalReturnPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatPercentage(totalReturnPercentage)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Overall return</p>
              </div>
              <div className={`p-2 rounded-full ${totalReturnPercentage >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                {totalReturnPercentage >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(assetAllocation).map(([type, data]) => {
              const percentage = totalCurrent > 0 ? (data.current / totalCurrent) * 100 : 0
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`} />
                      <span className="font-medium">{getTypeLabel(type)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {data.count}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(data.current)}</p>
                      <p className="text-xs text-gray-600">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top Performers */}
            <div>
              <h4 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top Performers
              </h4>
              <div className="space-y-2">
                {topPerformers.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{entry.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(entry.type)}`}>
                          {getTypeLabel(entry.type)}
                        </Badge>
                        {entry.source === "upload" && (
                          <Badge variant="secondary" className="text-xs">
                            Uploaded
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{formatPercentage(entry.returnPercentage)}</p>
                      <p className="text-xs text-gray-600">{formatCurrency(entry.gainLoss)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Underperformers */}
            {underPerformers.some((entry) => entry.returnPercentage < 0) && (
              <div>
                <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Needs Attention
                </h4>
                <div className="space-y-2">
                  {underPerformers
                    .filter((entry) => entry.returnPercentage < 0)
                    .slice(0, 3)
                    .map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{entry.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(entry.type)}`}>
                              {getTypeLabel(entry.type)}
                            </Badge>
                            {entry.source === "upload" && (
                              <Badge variant="secondary" className="text-xs">
                                Uploaded
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">{formatPercentage(entry.returnPercentage)}</p>
                          <p className="text-xs text-gray-600">{formatCurrency(entry.gainLoss)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detailed Holdings ({entries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Investment</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-right p-2">Invested</th>
                  <th className="text-right p-2">Current</th>
                  <th className="text-right p-2">Gain/Loss</th>
                  <th className="text-right p-2">Return %</th>
                  <th className="text-right p-2">Units</th>
                  <th className="text-right p-2">NAV</th>
                </tr>
              </thead>
              <tbody>
                {performanceEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{entry.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-600">{entry.date}</p>
                          {entry.source === "upload" && (
                            <Badge variant="secondary" className="text-xs">
                              Uploaded
                            </Badge>
                          )}
                          {entry.fileName && <p className="text-xs text-gray-500">from {entry.fileName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(entry.type)}`}>
                        {getTypeLabel(entry.type)}
                      </Badge>
                    </td>
                    <td className="text-right p-2 font-medium">{formatCurrency(entry.invested)}</td>
                    <td className="text-right p-2 font-medium">{formatCurrency(entry.current)}</td>
                    <td
                      className={`text-right p-2 font-medium ${
                        entry.gainLoss >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(entry.gainLoss)}
                    </td>
                    <td
                      className={`text-right p-2 font-medium ${
                        entry.returnPercentage >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPercentage(entry.returnPercentage)}
                    </td>
                    <td className="text-right p-2">{entry.units.toLocaleString("en-IN")}</td>
                    <td className="text-right p-2">₹{entry.nav.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Portfolio Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{entries.length}</p>
              <p className="text-sm text-blue-800">Total Investments</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {performanceEntries.filter((e) => e.returnPercentage > 0).length}
              </p>
              <p className="text-sm text-green-800">Profitable Investments</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {performanceEntries.filter((e) => e.returnPercentage < 0).length}
              </p>
              <p className="text-sm text-red-800">Loss-making Investments</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Portfolio Performance</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your portfolio has a {totalReturnPercentage >= 0 ? "positive" : "negative"} return of{" "}
                  {formatPercentage(totalReturnPercentage)}. This represents a {totalGainLoss >= 0 ? "gain" : "loss"} of{" "}
                  {formatCurrency(Math.abs(totalGainLoss))}.
                </p>
              </div>
            </div>

            {Object.keys(assetAllocation).length > 1 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Diversification</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your portfolio is diversified across {Object.keys(assetAllocation).length} asset classes. This helps
                    reduce risk and improve long-term returns.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Recommendations</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Review underperforming investments for potential reallocation</li>
                  <li>• Consider rebalancing if any asset class exceeds 60% of your portfolio</li>
                  <li>• Monitor your investments regularly and adjust based on market conditions</li>
                  {entries.filter((e) => e.source === "upload").length > 0 && (
                    <li>• Keep uploading fresh statements to track performance over time</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
