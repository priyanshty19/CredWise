"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, PieChart, Target, AlertCircle, Info, BarChart3 } from "lucide-react"

interface PortfolioEntry {
  id: string
  type: "stock" | "mutual_fund" | "bond" | "etf" | "crypto" | "other"
  name: string
  symbol?: string
  quantity: number
  currentPrice: number
  purchasePrice: number
  purchaseDate: string
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
}

interface PortfolioDashboardProps {
  portfolioData: PortfolioEntry[]
}

export default function PortfolioDashboard({ portfolioData }: PortfolioDashboardProps) {
  if (portfolioData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Portfolio Data</h3>
          <p className="text-muted-foreground">
            Upload your investment files or add manual entries to see your portfolio analysis here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalValue = portfolioData.reduce((sum, entry) => sum + entry.currentValue, 0)
  const totalGainLoss = portfolioData.reduce((sum, entry) => sum + entry.gainLoss, 0)
  const totalGainLossPercentage = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0

  // Calculate allocation by type
  const allocationByType = portfolioData.reduce(
    (acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + entry.currentValue
      return acc
    },
    {} as Record<string, number>,
  )

  const topPerformers = [...portfolioData].sort((a, b) => b.gainLossPercentage - a.gainLossPercentage).slice(0, 3)

  const worstPerformers = [...portfolioData].sort((a, b) => a.gainLossPercentage - b.gainLossPercentage).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Across {portfolioData.length} investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalGainLoss >= 0 ? "+" : ""}₹{Math.abs(totalGainLoss).toLocaleString("en-IN")}
            </div>
            <p className={`text-xs ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalGainLossPercentage.toFixed(2)}% overall return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {topPerformers[0] && (
              <>
                <div className="text-lg font-bold text-green-600">
                  +{topPerformers[0].gainLossPercentage.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground truncate">{topPerformers[0].name}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worst Performer</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {worstPerformers[0] && (
              <>
                <div className="text-lg font-bold text-red-600">
                  {worstPerformers[0].gainLossPercentage.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground truncate">{worstPerformers[0].name}</p>
              </>
            )}
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
          <div className="space-y-4">
            {Object.entries(allocationByType).map(([type, value]) => {
              const percentage = (value / totalValue) * 100
              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {type.replace("_", " ").toUpperCase()}
                      </Badge>
                      <span className="text-sm">₹{value.toLocaleString("en-IN")}</span>
                    </div>
                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-sm text-muted-foreground">₹{entry.currentValue.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">+{entry.gainLossPercentage.toFixed(2)}%</div>
                    <div className="text-sm text-green-600">+₹{entry.gainLoss.toLocaleString("en-IN")}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {worstPerformers.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-sm text-muted-foreground">₹{entry.currentValue.toLocaleString("en-IN")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{entry.gainLossPercentage.toFixed(2)}%</div>
                    <div className="text-sm text-red-600">₹{entry.gainLoss.toLocaleString("en-IN")}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Diversification Opportunity</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Consider adding more international exposure to reduce concentration risk in domestic markets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Rebalancing Suggested</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Your equity allocation has grown beyond target. Consider booking some profits and rebalancing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Strong Performance</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your portfolio is outperforming market benchmarks. Continue with your current strategy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
