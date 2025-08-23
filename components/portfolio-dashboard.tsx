"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { CreditCard, DollarSign, AlertTriangle, CheckCircle, Target, Award, Zap, BarChart3 } from "lucide-react"

interface PortfolioEntry {
  id: string
  cardName: string
  bank: string
  cardType: string
  monthlySpend: number
  rewardsEarned: number
  annualFee: number
  utilizationRate: number
  lastUsed: string
  status: "active" | "inactive" | "closed"
  creditLimit: number
  currentBalance: number
  rewardRate: number
  category: string
}

interface PortfolioSummary {
  totalCards: number
  totalMonthlySpend: number
  totalRewardsEarned: number
  totalAnnualFees: number
  averageUtilization: number
  activeCards: number
  totalCreditLimit: number
  totalCurrentBalance: number
  creditUtilizationRatio: number
  monthlyRewardRate: number
  annualRewardValue: number
  netRewardValue: number
}

interface PortfolioDashboardProps {
  portfolioEntries?: PortfolioEntry[]
  summary?: PortfolioSummary
  onOptimize?: () => void
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function PortfolioDashboard({
  portfolioEntries = [],
  summary = {
    totalCards: 0,
    totalMonthlySpend: 0,
    totalRewardsEarned: 0,
    totalAnnualFees: 0,
    averageUtilization: 0,
    activeCards: 0,
    totalCreditLimit: 0,
    totalCurrentBalance: 0,
    creditUtilizationRatio: 0,
    monthlyRewardRate: 0,
    annualRewardValue: 0,
    netRewardValue: 0,
  },
  onOptimize,
}: PortfolioDashboardProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  // Safe data with fallbacks
  const safePortfolioEntries = portfolioEntries || []
  const safeSummary = {
    totalCards: summary?.totalCards || 0,
    totalMonthlySpend: summary?.totalMonthlySpend || 0,
    totalRewardsEarned: summary?.totalRewardsEarned || 0,
    totalAnnualFees: summary?.totalAnnualFees || 0,
    averageUtilization: summary?.averageUtilization || 0,
    activeCards: summary?.activeCards || 0,
    totalCreditLimit: summary?.totalCreditLimit || 0,
    totalCurrentBalance: summary?.totalCurrentBalance || 0,
    creditUtilizationRatio: summary?.creditUtilizationRatio || 0,
    monthlyRewardRate: summary?.monthlyRewardRate || 0,
    annualRewardValue: summary?.annualRewardValue || 0,
    netRewardValue: summary?.netRewardValue || 0,
  }

  // Prepare chart data with safety checks
  const spendingByCategory =
    safePortfolioEntries.length > 0
      ? safePortfolioEntries.reduce(
          (acc, entry) => {
            const category = entry.category || "Other"
            acc[category] = (acc[category] || 0) + (entry.monthlySpend || 0)
            return acc
          },
          {} as Record<string, number>,
        )
      : {}

  const categoryData = Object.entries(spendingByCategory).map(([name, value]) => ({
    name,
    value,
  }))

  const utilizationData =
    safePortfolioEntries.length > 0
      ? safePortfolioEntries.map((entry) => ({
          name: entry.cardName || "Unknown Card",
          utilization: entry.utilizationRate || 0,
          limit: entry.creditLimit || 0,
          balance: entry.currentBalance || 0,
        }))
      : []

  const rewardEfficiencyData =
    safePortfolioEntries.length > 0
      ? safePortfolioEntries.map((entry) => ({
          name: entry.cardName || "Unknown Card",
          efficiency: entry.monthlySpend > 0 ? ((entry.rewardsEarned || 0) / (entry.monthlySpend || 1)) * 100 : 0,
          rewards: entry.rewardsEarned || 0,
          spend: entry.monthlySpend || 0,
        }))
      : []

  // Calculate optimization opportunities
  const optimizationOpportunities =
    safePortfolioEntries.length > 0
      ? safePortfolioEntries
          .filter((entry) => {
            const efficiency =
              entry.monthlySpend > 0 ? ((entry.rewardsEarned || 0) / (entry.monthlySpend || 1)) * 100 : 0
            return (
              efficiency < 2 ||
              (entry.utilizationRate || 0) > 80 ||
              (entry.annualFee || 0) > (entry.rewardsEarned || 0) * 12
            )
          })
          .map((entry) => ({
            cardName: entry.cardName || "Unknown Card",
            issues: [
              ...(entry.monthlySpend > 0 && ((entry.rewardsEarned || 0) / (entry.monthlySpend || 1)) * 100 < 2
                ? ["Low reward efficiency"]
                : []),
              ...((entry.utilizationRate || 0) > 80 ? ["High utilization"] : []),
              ...((entry.annualFee || 0) > (entry.rewardsEarned || 0) * 12 ? ["Annual fee exceeds rewards"] : []),
            ],
          }))
      : []

  if (safePortfolioEntries.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Portfolio Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Portfolio Data Available</h3>
              <p className="text-gray-500 mb-4">
                Upload your credit card statements to see detailed portfolio analysis and optimization recommendations.
              </p>
              <Button onClick={onOptimize} className="bg-blue-600 hover:bg-blue-700">
                Upload Statements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeSummary.totalCards}</div>
            <p className="text-xs text-muted-foreground">{safeSummary.activeCards} active cards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{safeSummary.totalMonthlySpend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{safeSummary.monthlyRewardRate.toFixed(2)}% reward rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Rewards</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{safeSummary.annualRewardValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Net: ₹{safeSummary.netRewardValue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeSummary.creditUtilizationRatio.toFixed(1)}%</div>
            <Progress value={safeSummary.creditUtilizationRatio} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="rewards">Reward Efficiency</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">No spending data available</div>
                )}
              </CardContent>
            </Card>

            {/* Credit Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Credit Utilization by Card</CardTitle>
              </CardHeader>
              <CardContent>
                {utilizationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={utilizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "utilization") return [`${Number(value).toFixed(1)}%`, "Utilization"]
                          return [value, name]
                        }}
                      />
                      <Bar dataKey="utilization" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">No utilization data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safePortfolioEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{entry.cardName}</p>
                        <p className="text-sm text-gray-500">{entry.bank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(entry.monthlySpend || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{entry.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward Efficiency Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {rewardEfficiencyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rewardEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "efficiency") return [`${Number(value).toFixed(2)}%`, "Efficiency"]
                        return [value, name]
                      }}
                    />
                    <Bar dataKey="efficiency" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">No reward efficiency data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Optimization Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizationOpportunities.length > 0 ? (
                <div className="space-y-4">
                  {optimizationOpportunities.map((opportunity, index) => (
                    <div key={index} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-orange-800">{opportunity.cardName}</h4>
                          <div className="mt-2 space-y-1">
                            {opportunity.issues.map((issue, issueIndex) => (
                              <div key={issueIndex} className="flex items-center gap-2 text-sm text-orange-700">
                                <AlertTriangle className="h-4 w-4" />
                                {issue}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                          Needs Attention
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button onClick={onOptimize} className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Get Optimization Recommendations
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Portfolio Optimized!</h3>
                  <p className="text-green-600">
                    Your credit card portfolio is well-optimized with no major issues detected.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Card Details Modal/Expanded View */}
      {selectedCard && (
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const card = safePortfolioEntries.find((entry) => entry.id === selectedCard)
              if (!card) return <div>Card not found</div>

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Basic Information</h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Card Name:</span>
                          <span>{card.cardName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bank:</span>
                          <span>{card.bank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span>{card.cardType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant={card.status === "active" ? "default" : "secondary"}>{card.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Financial Details</h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Credit Limit:</span>
                          <span>₹{(card.creditLimit || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Balance:</span>
                          <span>₹{(card.currentBalance || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Utilization:</span>
                          <span>{(card.utilizationRate || 0).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Fee:</span>
                          <span>₹{(card.annualFee || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
