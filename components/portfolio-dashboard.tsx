"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Target, Calendar, Building2 } from "lucide-react"
import type { PortfolioEntry, PortfolioSummary } from "@/app/actions/portfolio-actions"

interface PortfolioDashboardProps {
  portfolioEntries: PortfolioEntry[]
  summary: PortfolioSummary
}

export default function PortfolioDashboard({ portfolioEntries, summary }: PortfolioDashboardProps) {
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

  // Get top performing investments
  const topPerformers = [...portfolioEntries].sort((a, b) => b.gainLossPercentage - a.gainLossPercentage).slice(0, 5)

  // Get worst performing investments
  const worstPerformers = [...portfolioEntries].sort((a, b) => a.gainLossPercentage - b.gainLossPercentage).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Invested: {formatCurrency(summary.totalInvested)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {summary.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(summary.totalGainLoss)}
            </div>
            <p className={`text-xs ${summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPercentage(summary.totalGainLossPercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEntries}</div>
            <p className="text-xs text-muted-foreground">Across {Object.keys(summary.byBroker).length} sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalGainLossPercentage >= 0 ? "Good" : "Needs Attention"}
            </div>
            <Progress value={Math.min(Math.max(summary.totalGainLossPercentage + 50, 0), 100)} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Asset Allocation by Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(summary.byType).map(([type, data]) => {
              const percentage = (data.value / summary.totalValue) * 100
              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{type.replace("_", " ")}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(data.value)}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Allocation by Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(summary.byBroker).map(([broker, data]) => {
              const percentage = (data.value / summary.totalValue) * 100
              return (
                <div key={broker} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{broker}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(data.value)}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((investment) => (
              <div key={investment.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{investment.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {investment.broker && `${investment.broker} • `}
                    {formatCurrency(investment.currentValue)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    {formatPercentage(investment.gainLossPercentage)}
                  </div>
                  <div className="text-xs text-green-600">{formatCurrency(investment.gainLoss)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {worstPerformers.map((investment) => (
              <div key={investment.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{investment.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {investment.broker && `${investment.broker} • `}
                    {formatCurrency(investment.currentValue)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-600">
                    {formatPercentage(investment.gainLossPercentage)}
                  </div>
                  <div className="text-xs text-red-600">{formatCurrency(investment.gainLoss)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Investment</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Avg Price</th>
                  <th className="text-right p-2">Current Price</th>
                  <th className="text-right p-2">Current Value</th>
                  <th className="text-right p-2">Gain/Loss</th>
                  <th className="text-center p-2">Source</th>
                </tr>
              </thead>
              <tbody>
                {portfolioEntries.map((investment) => (
                  <tr key={investment.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{investment.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {investment.type.replace("_", " ")}
                        </div>
                      </div>
                    </td>
                    <td className="text-right p-2">{investment.quantity.toLocaleString()}</td>
                    <td className="text-right p-2">₹{investment.avgPrice.toFixed(2)}</td>
                    <td className="text-right p-2">₹{investment.currentPrice.toFixed(2)}</td>
                    <td className="text-right p-2">{formatCurrency(investment.currentValue)}</td>
                    <td className={`text-right p-2 ${investment.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      <div>{formatCurrency(investment.gainLoss)}</div>
                      <div className="text-xs">{formatPercentage(investment.gainLossPercentage)}</div>
                    </td>
                    <td className="text-center p-2">
                      <Badge variant={investment.source === "upload" ? "default" : "secondary"}>
                        {investment.broker || investment.source}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
