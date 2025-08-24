"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  PieChart,
  DollarSign,
  Target,
  ArrowUpIcon,
  ArrowDownIcon,
  User,
  Phone,
  CreditCard,
  Building2,
  Percent,
} from "lucide-react"
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

  const getReturnColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getReturnIcon = (value: number) => {
    if (value > 0) return <ArrowUpIcon className="h-4 w-4 text-green-600" />
    if (value < 0) return <ArrowDownIcon className="h-4 w-4 text-red-600" />
    return <Target className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="space-y-6">
      {/* Processing Info & Personal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-600">Processing Info</h3>
              <div className="flex justify-between text-sm">
                <span>Holdings processed:</span>
                <span className="font-medium">{data.data.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing time:</span>
                <span className="font-medium">{processingTime}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {summary.personalDetails && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-600">Personal Details</h3>
                {summary.personalDetails.name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-gray-500" />
                    <span>{summary.personalDetails.name}</span>
                  </div>
                )}
                {summary.personalDetails.mobileNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-gray-500" />
                    <span>{summary.personalDetails.mobileNumber}</span>
                  </div>
                )}
                {summary.personalDetails.pan && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-3 w-3 text-gray-500" />
                    <span>{summary.personalDetails.pan}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Total Invested</p>
                <p className="text-lg font-bold">{formatCurrency(summary.totalInvestments)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Current Value</p>
                <p className="text-lg font-bold">{formatCurrency(summary.currentPortfolioValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getReturnIcon(summary.profitLoss)}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Profit/Loss</p>
                <p className={`text-lg font-bold ${getReturnColor(summary.profitLoss)}`}>
                  {formatCurrency(summary.profitLoss)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-purple-600" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Return %</p>
                <p className={`text-lg font-bold ${getReturnColor(summary.profitLossPercentage)}`}>
                  {formatPercentage(summary.profitLossPercentage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">XIRR</p>
                <p className={`text-lg font-bold ${getReturnColor(summary.xirr)}`}>{formatPercentage(summary.xirr)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Top Holdings */}
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

        {/* Pie Chart - Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category-wise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {graphData.pieChart.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold">{formatCurrency(item.units)}</span>
                      <span className="text-xs text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invested vs Current Value Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Invested vs Current Value Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {graphData.lineGraph.investedValue.slice(0, 9).map((item, index) => {
              const currentItem = graphData.lineGraph.currentValue[index]
              const invested = item.y
              const current = currentItem?.y || 0
              const gain = current - invested
              const gainPercentage = invested > 0 ? (gain / invested) * 100 : 0

              return (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm flex-1 mr-2">{item.x}</h4>
                    <Badge variant={gain >= 0 ? "default" : "destructive"} className="text-xs">
                      {formatPercentage(gainPercentage)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Invested:</span>
                      <span className="font-semibold">{formatCurrency(invested)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-semibold">{formatCurrency(current)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gain/Loss:</span>
                      <span className={`font-semibold ${getReturnColor(gain)}`}>
                        {gain >= 0 ? "+" : ""}
                        {formatCurrency(gain)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Category-wise Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {graphData.categoryBreakdown.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">{item.category}</h4>
                  <Badge variant="outline">{item.count} funds</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Invested</p>
                    <p className="font-semibold">{formatCurrency(item.totalInvested)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current</p>
                    <p className="font-semibold">{formatCurrency(item.currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Returns</p>
                    <p className={`font-semibold ${getReturnColor(item.returns)}`}>{formatCurrency(item.returns)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Allocation</p>
                    <p className="font-semibold">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>

                <Progress value={item.percentage} className="h-2 mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AMC Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            AMC-wise Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {graphData.amcBreakdown.slice(0, 8).map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{item.amc}</span>
                    <span className="text-xs text-gray-500 ml-2">({item.count} funds)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{formatCurrency(item.currentValue)}</span>
                    <span className="text-xs text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Invested: {formatCurrency(item.totalInvested)}</span>
                  <span className={getReturnColor(item.returns)}>Returns: {formatCurrency(item.returns)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Holdings Table */}
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
                  <th className="text-right p-2">Units</th>
                  <th className="text-right p-2">Invested</th>
                  <th className="text-right p-2">Current</th>
                  <th className="text-right p-2">Returns</th>
                  <th className="text-right p-2">XIRR</th>
                </tr>
              </thead>
              <tbody>
                {data.data.slice(0, 25).map((item, index) => {
                  const returnPercentage = item.investedValue > 0 ? (item.returns / item.investedValue) * 100 : 0

                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">
                        <div className="max-w-xs">
                          <div className="truncate">{item.schemeName}</div>
                          <div className="text-xs text-gray-500">{item.folioNo}</div>
                        </div>
                      </td>
                      <td className="p-2 text-gray-600">{item.amc}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">{item.units.toFixed(3)}</td>
                      <td className="p-2 text-right">{formatCurrency(item.investedValue)}</td>
                      <td className="p-2 text-right font-semibold">{formatCurrency(item.currentValue)}</td>
                      <td className={`p-2 text-right font-semibold ${getReturnColor(item.returns)}`}>
                        {formatCurrency(item.returns)}
                        <div className="text-xs">({formatPercentage(returnPercentage)})</div>
                      </td>
                      <td className={`p-2 text-right ${getReturnColor(item.xirr)}`}>{formatPercentage(item.xirr)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {data.data.length > 25 && (
            <div className="text-center text-sm text-gray-500 mt-4">Showing top 25 of {data.data.length} holdings</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
