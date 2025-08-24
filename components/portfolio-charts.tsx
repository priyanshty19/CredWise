"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, PieChart, DollarSign, Target, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import type { PortfolioParseResult } from "@/lib/portfolio-parser"

interface PortfolioChartsProps {
  data: PortfolioParseResult
}

export default function PortfolioCharts({ data }: PortfolioChartsProps) {
  const { graphData, summary, processingTime } = data

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const returnPercentage = summary.totalInvested > 0 ? (summary.totalReturns / summary.totalInvested) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Processing Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Processed {summary.totalSchemes} investments</span>
        <span>Processing time: {processingTime}ms</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-lg font-bold">{formatCurrency(summary.totalInvested)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-lg font-bold">{formatCurrency(summary.totalCurrent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {summary.totalReturns >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-600" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className={`text-lg font-bold ${summary.totalReturns >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(summary.totalReturns)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Return %</p>
                <p className={`text-lg font-bold ${returnPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatPercentage(returnPercentage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart - Current Value by Scheme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Holdings by Current Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {graphData.barGraph.slice(0, 10).map((item, index) => {
              const maxValue = Math.max(...graphData.barGraph.map((d) => d.y))
              const percentage = (item.y / maxValue) * 100

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate flex-1 mr-4">{item.x}</span>
                    <span className="text-sm font-bold text-right">{formatCurrency(item.y)}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Line Chart - Invested vs Current Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Invested vs Current Value Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {graphData.lineGraph.investedValue.slice(0, 8).map((item, index) => {
              const currentItem = graphData.lineGraph.currentValue[index]
              const invested = item.y
              const current = currentItem?.y || 0
              const gain = current - invested
              const gainPercentage = invested > 0 ? (gain / invested) * 100 : 0

              return (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm flex-1 mr-4">{item.x}</h4>
                    <Badge variant={gain >= 0 ? "default" : "destructive"} className="text-xs">
                      {formatPercentage(gainPercentage)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Invested</p>
                      <p className="font-semibold">{formatCurrency(invested)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Current</p>
                      <p className="font-semibold">{formatCurrency(current)}</p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-600">Gain/Loss</p>
                    <p className={`font-semibold ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {gain >= 0 ? "+" : ""}
                      {formatCurrency(gain)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart - Category Distribution */}
      {graphData.pieChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category-wise Units Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {graphData.pieChart.map((item, index) => {
                const totalUnits = graphData.pieChart.reduce((sum, cat) => sum + cat.units, 0)
                const percentage = totalUnits > 0 ? (item.units / totalUnits) * 100 : 0

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold">{item.units.toFixed(2)} units</span>
                        <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Scheme Name</th>
                  <th className="text-left p-2">AMC</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Invested</th>
                  <th className="text-right p-2">Current</th>
                  <th className="text-right p-2">Returns</th>
                </tr>
              </thead>
              <tbody>
                {data.data.slice(0, 20).map((item, index) => {
                  const returnPercentage = item.investedValue > 0 ? (item.returns / item.investedValue) * 100 : 0

                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">
                        {item.schemeName.length > 40 ? item.schemeName.substring(0, 40) + "..." : item.schemeName}
                      </td>
                      <td className="p-2 text-gray-600">{item.amc}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">{formatCurrency(item.investedValue)}</td>
                      <td className="p-2 text-right font-semibold">{formatCurrency(item.currentValue)}</td>
                      <td
                        className={`p-2 text-right font-semibold ${item.returns >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(item.returns)}
                        <div className="text-xs">({formatPercentage(returnPercentage)})</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
