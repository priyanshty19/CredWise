"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, PieChart, BarChart3, Target, DollarSign } from "lucide-react"

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

  // Calculate allocation by type
  const allocationByType = portfolioEntries.reduce(
    (acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + entry.currentValue
      return acc
    },
    {} as Record<string, number>,
  )

  const allocationData = Object.entries(allocationByType).map(([type, value]) => ({
    type: type.replace("_", " ").toUpperCase(),
    value,
    percentage: (value / totalCurrentValue) * 100,
  }))

  // Top performers
  const topPerformers = [...portfolioEntries].sort((a, b) => b.gainLossPercentage - a.gainLossPercentage).slice(0, 5)

  // Bottom performers
  const bottomPerformers = [...portfolioEntries].sort((a, b) => a.gainLossPercentage - b.gainLossPercentage).slice(0, 5)

  const getTypeColor = (type: string) => {
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
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">₹{totalInvested.toLocaleString("en-IN")}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">₹{totalCurrentValue.toLocaleString("en-IN")}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalGainLoss >= 0 ? "+" : ""}₹{totalGainLoss.toLocaleString("en-IN")}
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
                <p className="text-sm font-medium text-muted-foreground">Return %</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalGainLossPercentage >= 0 ? "+" : ""}
                  {totalGainLossPercentage.toFixed(2)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
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
            {allocationData.map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.type}</span>
                  <span className="text-sm text-muted-foreground">
                    ₹{item.value.toLocaleString("en-IN")} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(entry.type)}`}>
                      {entry.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">₹{entry.currentValue.toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+{entry.gainLossPercentage.toFixed(2)}%</p>
                  <p className="text-sm text-green-600">+₹{entry.gainLoss.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* All Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            All Holdings ({portfolioEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {portfolioEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(entry.type)}`}>
                      {entry.type.replace("_", " ")}
                    </Badge>
                    {entry.source === "upload" && (
                      <Badge variant="secondary" className="text-xs">
                        Uploaded
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Invested: ₹{entry.amount.toLocaleString("en-IN")}</span>
                    <span>Current: ₹{entry.currentValue.toLocaleString("en-IN")}</span>
                    {entry.units && <span>Units: {entry.units}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${entry.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {entry.gainLoss >= 0 ? "+" : ""}₹{entry.gainLoss.toLocaleString("en-IN")}
                  </p>
                  <p className={`text-sm ${entry.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ({entry.gainLossPercentage >= 0 ? "+" : ""}
                    {entry.gainLossPercentage.toFixed(2)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Performers */}
      {bottomPerformers.some((entry) => entry.gainLoss < 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bottomPerformers
              .filter((entry) => entry.gainLoss < 0)
              .map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(entry.type)}`}>
                        {entry.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">₹{entry.currentValue.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{entry.gainLossPercentage.toFixed(2)}%</p>
                    <p className="text-sm text-red-600">₹{entry.gainLoss.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
