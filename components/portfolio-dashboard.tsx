"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertTriangle,
  Building2,
  Calendar,
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
  broker?: string
  folio?: string
  isin?: string
}

interface PortfolioDashboardProps {
  entries: PortfolioEntry[]
}

export default function PortfolioDashboard({ entries }: PortfolioDashboardProps) {
  console.log("📊 Dashboard rendering with real parsed entries:", entries.length)

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

  // Broker allocation
  const brokerAllocation = entries.reduce(
    (acc, entry) => {
      const broker = entry.broker || entry.source === "manual" ? "Manual Entry" : "Unknown"
      if (!acc[broker]) {
        acc[broker] = { invested: 0, current: 0, count: 0 }
      }
      acc[broker].invested += entry.invested
      acc[broker].current += entry.current
      acc[broker].count += 1
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

  const getBrokerColor = (broker: string) => {
    const colors = {
      Zerodha: "bg-orange-100 text-orange-800",
      Groww: "bg-green-100 text-green-800",
      "HDFC Securities": "bg-blue-100 text-blue-800",
      "Angel One": "bg-red-100 text-red-800",
      "Manual Entry": "bg-gray-100 text-gray-800",
    }
    return colors[broker as keyof typeof colors] || "bg-purple-100 text-purple-800"
  }

  return (
    <div className="space-y-6">
      {/* Real Data Confirmation */}
      <div className="text-xs text-green-700 bg-green-50 p-3 rounded border border-green-200">
        ✅ <strong>Real Data Analysis:</strong> Showing analysis of {entries.length} actual investments from your
        uploaded files and manual entries
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

        {/* Broker Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Broker Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(brokerAllocation).map(([broker, data]) => {
              const percentage = totalCurrent > 0 ? (data.current / totalCurrent) * 100 : 0
              return (
                <div key={broker} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span className="font-medium">{broker}</span>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{entry.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(entry.type)}`}>
                      {getTypeLabel(entry.type)}
                    </Badge>
                    {entry.broker && (
                      <Badge variant="outline" className={`text-xs ${getBrokerColor(entry.broker)}`}>
                        {entry.broker}
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
          </CardContent>
        </Card>

        {/* Underperformers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {underPerformers
              .filter((entry) => entry.returnPercentage < 0)
              .slice(0, 5)
              .map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{entry.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(entry.type)}`}>
                        {getTypeLabel(entry.type)}
                      </Badge>
                      {entry.broker && (
                        <Badge variant="outline" className={`text-xs ${getBrokerColor(entry.broker)}`}>
                          {entry.broker}
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
            {underPerformers.filter((entry) => entry.returnPercentage < 0).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>Great! No underperforming investments found.</p>
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
                  <th className="text-left p-2">Broker</th>
                  <th className="text-right p-2">Invested</th>
                  <th className="text-right p-2">Current</th>
                  <th className="text-right p-2">Gain/Loss</th>
                  <th className="text-right p-2">Return %</th>
                  <th className="text-right p-2">Units</th>
                  <th className="text-right p-2">NAV/Price</th>
                </tr>
              </thead>
              <tbody>
                {performanceEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{entry.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {entry.date}
                          </p>
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
                    <td className="p-2">
                      {entry.broker ? (
                        <Badge variant="outline" className={`text-xs ${getBrokerColor(entry.broker)}`}>
                          {entry.broker}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-500">Manual</span>
                      )}
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
            Portfolio Insights & Recommendations
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
                <h4 className="font-medium text-blue-900">Real Portfolio Performance</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Based on your actual investment data, your portfolio has a{" "}
                  {totalReturnPercentage >= 0 ? "positive" : "negative"} return of{" "}
                  {formatPercentage(totalReturnPercentage)}. This represents a {totalGainLoss >= 0 ? "gain" : "loss"} of{" "}
                  {formatCurrency(Math.abs(totalGainLoss))} from your total investment of{" "}
                  {formatCurrency(totalInvested)}.
                </p>
              </div>
            </div>

            {Object.keys(brokerAllocation).length > 1 && (
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Multi-Broker Portfolio</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Your investments are spread across {Object.keys(brokerAllocation).length} different platforms:{" "}
                    {Object.keys(brokerAllocation).join(", ")}. This diversification across brokers can help reduce
                    platform-specific risks.
                  </p>
                </div>
              </div>
            )}

            {Object.keys(assetAllocation).length > 1 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Asset Diversification</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your portfolio is diversified across {Object.keys(assetAllocation).length} asset classes:{" "}
                    {Object.keys(assetAllocation).map(getTypeLabel).join(", ")}. This diversification helps reduce risk
                    and can improve long-term returns.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Actionable Recommendations</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  {performanceEntries.filter((e) => e.returnPercentage < -10).length > 0 && (
                    <li>Consider reviewing investments with losses &gt; 10% for potential reallocation</li>
                  )}
                  {Object.values(assetAllocation).some((data) => data.current / totalCurrent > 0.6) && (
                    <li>Consider rebalancing - one asset class represents &gt;60% of your portfolio</li>
                  )}
                  <li>Monitor your investments regularly and rebalance quarterly</li>
                  <li>Keep uploading fresh statements to track performance over time</li>
                  {entries.filter((e) => e.source === "upload").length > 0 && (
                    <li>Great job using real data! This analysis is based on your actual investments</li>
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
