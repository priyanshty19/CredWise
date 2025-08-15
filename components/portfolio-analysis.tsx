"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  Plus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Calculator,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Info,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { uploadPortfolioFiles, addManualEntry } from "@/app/actions/portfolio-actions"
import PortfolioDashboard from "@/components/portfolio-dashboard"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "completed" | "error"
  data?: any
  error?: string
}

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

interface ManualEntry {
  type: "stock" | "mutual_fund" | "bond" | "etf" | "crypto" | "other"
  name: string
  symbol: string
  quantity: string
  currentPrice: string
  purchasePrice: string
  purchaseDate: string
}

export default function PortfolioAnalysis() {
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // Manual entry form state
  const [manualEntry, setManualEntry] = useState<ManualEntry>({
    type: "stock",
    name: "",
    symbol: "",
    quantity: "",
    currentPrice: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Process each file
    for (const file of acceptedFiles) {
      const fileId = newFiles.find((f) => f.name === file.name)?.id
      if (!fileId) continue

      try {
        // Update status to processing
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing" } : f)))

        const formData = new FormData()
        formData.append("file", file)

        const result = await uploadPortfolioFiles(formData)

        if (result.success && result.data) {
          // Update file status and add portfolio entries
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "completed",
                    data: result.data,
                  }
                : f,
            ),
          )

          // Add parsed entries to portfolio
          if (result.data.portfolioEntries) {
            setPortfolioEntries((prev) => [...prev, ...result.data.portfolioEntries])
          }
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: "error", error: result.error || "Processing failed" } : f,
            ),
          )
        }
      } catch (error) {
        console.error("File processing error:", error)
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "error", error: "Upload failed" } : f)),
        )
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (file?.data?.portfolioEntries) {
      // Remove associated portfolio entries
      const entryIds = file.data.portfolioEntries.map((entry: PortfolioEntry) => entry.id)
      setPortfolioEntries((prev) => prev.filter((entry) => !entryIds.includes(entry.id)))
    }
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualEntry.name || !manualEntry.quantity || !manualEntry.currentPrice || !manualEntry.purchasePrice) {
      return
    }

    const quantity = Number.parseFloat(manualEntry.quantity)
    const currentPrice = Number.parseFloat(manualEntry.currentPrice)
    const purchasePrice = Number.parseFloat(manualEntry.purchasePrice)
    const currentValue = quantity * currentPrice
    const gainLoss = currentValue - quantity * purchasePrice
    const gainLossPercentage = ((currentPrice - purchasePrice) / purchasePrice) * 100

    const entry: PortfolioEntry = {
      id: Math.random().toString(36).substr(2, 9),
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

    try {
      const result = await addManualEntry(entry)
      if (result.success) {
        setPortfolioEntries((prev) => [...prev, entry])
        setManualEntry({
          type: "stock",
          name: "",
          symbol: "",
          quantity: "",
          currentPrice: "",
          purchasePrice: "",
          purchaseDate: new Date().toISOString().split("T")[0],
        })
      }
    } catch (error) {
      console.error("Error adding manual entry:", error)
    }
  }

  const generateAnalysis = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setShowDashboard(true)
  }

  const hasData = uploadedFiles.some((f) => f.status === "completed") || portfolioEntries.length > 0
  const totalValue = portfolioEntries.reduce((sum, entry) => sum + entry.currentValue, 0)
  const totalGainLoss = portfolioEntries.reduce((sum, entry) => sum + entry.gainLoss, 0)

  if (showDashboard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Your Financial Portfolio Analysis</h2>
          <Button variant="outline" onClick={() => setShowDashboard(false)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add More Data
          </Button>
        </div>

        <PortfolioDashboard portfolioData={portfolioEntries} />
      </div>
    )
  }

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
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag & drop your investment statements here, or click to select files
                    </p>
                    <p className="text-sm text-gray-500">Supports PDF, CSV, Excel files up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Supported Platforms */}
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

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          {file.status === "completed" && file.data && (
                            <p className="text-xs text-green-600">
                              ✓ {file.data.portfolioEntries?.length || 0} investments found
                            </p>
                          )}
                          {file.status === "error" && <p className="text-xs text-red-600">✗ {file.error}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                        {file.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-orange-600" />}
                        {file.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {file.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                        <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
              <form onSubmit={handleManualSubmit} className="space-y-4">
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
                      required
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
                      required
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
                      required
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
                      required
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={manualEntry.purchaseDate}
                      onChange={(e) => setManualEntry({ ...manualEntry, purchaseDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </form>
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
                      {Math.abs(totalGainLoss).toLocaleString("en-IN")}
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
                        onClick={() => setPortfolioEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <PortfolioDashboard portfolioData={portfolioEntries} />
        </TabsContent>
      </Tabs>

      {/* Generate Analysis Button */}
      {hasData && !showDashboard && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ready to Generate Analysis</h3>
                <p className="text-gray-600">
                  You have {uploadedFiles.filter((f) => f.status === "completed").length} processed files and{" "}
                  {portfolioEntries.length} portfolio entries
                </p>
              </div>
              <Button onClick={generateAnalysis} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Need help?</strong> Upload your investment statements for automatic analysis, or manually add any
          financial data. We support most major investment platforms and banking formats.
        </AlertDescription>
      </Alert>
    </div>
  )
}
