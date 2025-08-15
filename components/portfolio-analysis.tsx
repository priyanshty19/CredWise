"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, TrendingUp, TrendingDown, BarChart3, FileText, Calculator, CheckCircle } from "lucide-react"
import { submitPortfolioData } from "@/app/actions/portfolio-actions"
import PortfolioDashboard from "@/components/portfolio-dashboard"

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

export default function PortfolioAnalysis() {
  const [activeTab, setActiveTab] = useState("upload")
  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  // Manual entry form state
  const [manualEntry, setManualEntry] = useState({
    type: "stock" as const,
    name: "",
    symbol: "",
    quantity: "",
    currentPrice: "",
    purchasePrice: "",
    purchaseDate: "",
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simulate file processing
      console.log("Processing file:", file.name)
      // In a real app, you'd parse CSV/Excel files here
      setSubmitStatus("success")
      setTimeout(() => setSubmitStatus("idle"), 3000)
    }
  }

  const addManualEntry = () => {
    if (!manualEntry.name || !manualEntry.quantity || !manualEntry.currentPrice || !manualEntry.purchasePrice) {
      return
    }

    const quantity = Number.parseFloat(manualEntry.quantity)
    const currentPrice = Number.parseFloat(manualEntry.currentPrice)
    const purchasePrice = Number.parseFloat(manualEntry.purchasePrice)
    const currentValue = quantity * currentPrice
    const gainLoss = currentValue - quantity * purchasePrice
    const gainLossPercentage = ((currentPrice - purchasePrice) / purchasePrice) * 100

    const newEntry: PortfolioEntry = {
      id: Date.now().toString(),
      type: manualEntry.type,
      name: manualEntry.name,
      symbol: manualEntry.symbol || undefined,
      quantity,
      currentPrice,
      purchasePrice,
      purchaseDate: manualEntry.purchaseDate,
      currentValue,
      gainLoss,
      gainLossPercentage,
    }

    setPortfolioEntries([...portfolioEntries, newEntry])

    // Reset form
    setManualEntry({
      type: "stock",
      name: "",
      symbol: "",
      quantity: "",
      currentPrice: "",
      purchasePrice: "",
      purchaseDate: "",
    })
  }

  const removeEntry = (id: string) => {
    setPortfolioEntries(portfolioEntries.filter((entry) => entry.id !== id))
  }

  const handleSubmitPortfolio = async () => {
    if (portfolioEntries.length === 0) return

    setIsSubmitting(true)
    try {
      await submitPortfolioData(portfolioEntries)
      setSubmitStatus("success")
      setActiveTab("dashboard")
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus("idle"), 3000)
    }
  }

  const totalValue = portfolioEntries.reduce((sum, entry) => sum + entry.currentValue, 0)
  const totalGainLoss = portfolioEntries.reduce((sum, entry) => sum + entry.gainLoss, 0)
  const totalGainLossPercentage = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Files</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Manual Entry</span>
            <span className="sm:hidden">Manual</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Investment Statements
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload your brokerage statements, mutual fund statements, or portfolio CSV files
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Drop files here or click to browse</h3>
                  <p className="text-sm text-muted-foreground">Supports PDF, CSV, Excel files up to 10MB</p>
                </div>
                <Input
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="mt-4 max-w-xs mx-auto"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Zerodha Console
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Groww Statements
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  HDFC Securities
                </div>
              </div>

              {submitStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  File uploaded successfully! Processing your portfolio data...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Manual Portfolio Entry
              </CardTitle>
              <p className="text-sm text-muted-foreground">Add your investments manually for detailed analysis</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Investment Type</Label>
                  <select
                    id="type"
                    value={manualEntry.type}
                    onChange={(e) => setManualEntry({ ...manualEntry, type: e.target.value as any })}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="stock">Stock</option>
                    <option value="mutual_fund">Mutual Fund</option>
                    <option value="etf">ETF</option>
                    <option value="bond">Bond</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Investment Name</Label>
                  <Input
                    id="name"
                    value={manualEntry.name}
                    onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
                    placeholder="e.g., Reliance Industries"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol (Optional)</Label>
                  <Input
                    id="symbol"
                    value={manualEntry.symbol}
                    onChange={(e) => setManualEntry({ ...manualEntry, symbol: e.target.value })}
                    placeholder="e.g., RELIANCE"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={manualEntry.quantity}
                    onChange={(e) => setManualEntry({ ...manualEntry, quantity: e.target.value })}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPrice">Current Price (₹)</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    value={manualEntry.currentPrice}
                    onChange={(e) => setManualEntry({ ...manualEntry, currentPrice: e.target.value })}
                    placeholder="2500.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={manualEntry.purchasePrice}
                    onChange={(e) => setManualEntry({ ...manualEntry, purchasePrice: e.target.value })}
                    placeholder="2000.00"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={manualEntry.purchaseDate}
                    onChange={(e) => setManualEntry({ ...manualEntry, purchaseDate: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={addManualEntry} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Investment
              </Button>
            </CardContent>
          </Card>

          {/* Portfolio Entries List */}
          {portfolioEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Portfolio ({portfolioEntries.length} investments)</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹{totalValue.toLocaleString("en-IN")}</div>
                    <div
                      className={`text-sm flex items-center gap-1 ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {totalGainLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}₹
                      {Math.abs(totalGainLoss).toLocaleString("en-IN")} ({totalGainLossPercentage.toFixed(2)}%)
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolioEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {entry.type.replace("_", " ").toUpperCase()}
                          </Badge>
                          <span className="font-medium">{entry.name}</span>
                          {entry.symbol && <span className="text-sm text-muted-foreground">({entry.symbol})</span>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {entry.quantity} units × ₹{entry.currentPrice} = ₹{entry.currentValue.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${entry.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {entry.gainLoss >= 0 ? "+" : ""}₹{entry.gainLoss.toLocaleString("en-IN")}
                        </div>
                        <div className={`text-sm ${entry.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ({entry.gainLossPercentage.toFixed(2)}%)
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(entry.id)}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSubmitPortfolio} disabled={isSubmitting} className="w-full mt-4">
                  {isSubmitting ? "Analyzing Portfolio..." : "Analyze Portfolio"}
                </Button>

                {submitStatus === "success" && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg mt-4">
                    <CheckCircle className="h-4 w-4" />
                    Portfolio analysis complete! Check the Dashboard tab.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <PortfolioDashboard portfolioData={portfolioEntries} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
