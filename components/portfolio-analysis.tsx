"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  Plus,
  CheckCircle,
  X,
  Loader2,
  BarChart3,
  PieChart,
  FileText,
  AlertCircle,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { uploadPortfolioFiles } from "@/app/actions/portfolio-actions"
import PortfolioDashboard from "@/components/portfolio-dashboard"

interface UploadedFile {
  id: string
  name: string
  status: "uploading" | "processing" | "completed" | "error"
  entriesCount?: number
  error?: string
  broker?: string
  fileType?: string
  summary?: {
    totalInvestments: number
    totalInvested: number
    totalCurrent: number
    totalGainLoss: number
    returnPercentage: number
  }
}

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

export default function PortfolioAnalysis() {
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manual entry form state
  const [manualEntry, setManualEntry] = useState({
    name: "",
    type: "mutual_fund" as const,
    invested: "",
    current: "",
    units: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    // Add files to uploaded files list with uploading status
    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      status: "uploading",
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    try {
      // Process each file
      for (const file of Array.from(files)) {
        const fileId = newFiles.find((f) => f.name === file.name)?.id
        if (!fileId) continue

        // Update status to processing
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing" } : f)))

        // Create FormData and upload
        const formData = new FormData()
        formData.append("file", file)

        const result = await uploadPortfolioFiles(formData)

        if (result.success && result.data) {
          // Update status to completed with detailed info
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "completed",
                    entriesCount: result.data?.length || 0,
                    broker: result.broker,
                    fileType: result.fileType,
                    summary: result.summary,
                  }
                : f,
            ),
          )

          // Add entries to portfolio with source and fileName
          const newEntries: PortfolioEntry[] = result.data.map((entry) => ({
            ...entry,
            source: "upload" as const,
            fileName: file.name,
          }))

          setPortfolioEntries((prev) => [...prev, ...newEntries])

          console.log("✅ Added real parsed entries to portfolio:", newEntries)
        } else {
          // Update status to error
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, status: "error", error: result.error || "Upload failed" } : f)),
          )
        }
      }

      // Auto-switch to dashboard if we have entries
      if (portfolioEntries.length > 0 || uploadedFiles.some((f) => f.status === "completed")) {
        setTimeout(() => setActiveTab("dashboard"), 1500)
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (file) {
      // Remove associated portfolio entries
      setPortfolioEntries((prev) => prev.filter((entry) => entry.fileName !== file.name))
    }
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const invested = Number.parseFloat(manualEntry.invested)
    const current = Number.parseFloat(manualEntry.current)
    const units = Number.parseFloat(manualEntry.units)

    if (!manualEntry.name || isNaN(invested) || isNaN(current) || isNaN(units)) {
      return
    }

    const newEntry: PortfolioEntry = {
      id: `manual-${Date.now()}`,
      name: manualEntry.name,
      type: manualEntry.type,
      invested,
      current,
      units,
      nav: current / units,
      date: manualEntry.date,
      source: "manual",
    }

    setPortfolioEntries((prev) => [...prev, newEntry])

    // Reset form
    setManualEntry({
      name: "",
      type: "mutual_fund",
      invested: "",
      current: "",
      units: "",
      date: new Date().toISOString().split("T")[0],
    })

    // Switch to dashboard
    setActiveTab("dashboard")
  }

  const removePortfolioEntry = (id: string) => {
    setPortfolioEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case "uploading":
        return "Uploading file..."
      case "processing":
        return "Parsing investment data..."
      case "completed":
        return `${file.entriesCount} investments found from ${file.broker}`
      case "error":
        return file.error || "Upload failed"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Current Financial Portfolio & Analysis
          </CardTitle>
          <p className="text-gray-600">
            Upload your real investment statements from brokers like Zerodha, Groww, HDFC Securities, Angel One, etc.
          </p>
        </CardHeader>
      </Card>

      {/* File Format Support Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Supported Formats:</strong> CSV files from Zerodha Console, Groww, HDFC Securities, Angel One. Excel
          and PDF support coming soon. For best results, export your portfolio as CSV from your broker's platform.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
            {portfolioEntries.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {portfolioEntries.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Real Investment Statements</h3>
                  <p className="text-gray-600 mb-4">
                    Upload CSV files exported from your broker's platform for accurate portfolio analysis
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv,.xlsx,.xls,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <Button
                    onClick={handleFileButtonClick}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Real Data...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 mt-2">Best: CSV from broker platforms | Limited: Excel, PDF</p>
                </div>
              </div>

              {/* Supported Platforms */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Zerodha Console
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Groww Portfolio
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  HDFC Securities
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Angel One
                </div>
              </div>

              {/* How to Export Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How to Export Your Portfolio:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Zerodha:</strong> Console → Holdings → Export to CSV
                  </p>
                  <p>
                    <strong>Groww:</strong> Portfolio → Export → Download CSV
                  </p>
                  <p>
                    <strong>HDFC Securities:</strong> Portfolio → Holdings → Export
                  </p>
                  <p>
                    <strong>Angel One:</strong> Portfolio → Holdings → Download
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-900">Processing Files</h4>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(file.status)}
                          <div>
                            <p className="font-medium text-sm text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-600">{getStatusText(file)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* File Summary */}
                      {file.status === "completed" && file.summary && (
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="text-green-700">Investments</p>
                              <p className="font-semibold text-green-900">{file.summary.totalInvestments}</p>
                            </div>
                            <div>
                              <p className="text-green-700">Invested</p>
                              <p className="font-semibold text-green-900">
                                ₹{file.summary.totalInvested.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <p className="text-green-700">Current</p>
                              <p className="font-semibold text-green-900">
                                ₹{file.summary.totalCurrent.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <p className="text-green-700">Return</p>
                              <p
                                className={`font-semibold ${file.summary.totalGainLoss >= 0 ? "text-green-900" : "text-red-600"}`}
                              >
                                {file.summary.returnPercentage >= 0 ? "+" : ""}
                                {file.summary.returnPercentage.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error Details */}
                      {file.status === "error" && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">{file.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Current Portfolio Summary */}
              {portfolioEntries.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Live Portfolio Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-green-700">Total Investments</p>
                      <p className="font-semibold text-green-900">{portfolioEntries.length}</p>
                    </div>
                    <div>
                      <p className="text-green-700">Total Invested</p>
                      <p className="font-semibold text-green-900">
                        ₹{portfolioEntries.reduce((sum, entry) => sum + entry.invested, 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700">Current Value</p>
                      <p className="font-semibold text-green-900">
                        ₹{portfolioEntries.reduce((sum, entry) => sum + entry.current, 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700">Total Gain/Loss</p>
                      <p
                        className={`font-semibold flex items-center gap-1 ${
                          portfolioEntries.reduce((sum, entry) => sum + (entry.current - entry.invested), 0) >= 0
                            ? "text-green-900"
                            : "text-red-600"
                        }`}
                      >
                        {portfolioEntries.reduce((sum, entry) => sum + (entry.current - entry.invested), 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        ₹
                        {portfolioEntries
                          .reduce((sum, entry) => sum + (entry.current - entry.invested), 0)
                          .toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("dashboard")} className="mt-4 bg-green-600 hover:bg-green-700">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Investment Manually</CardTitle>
              <p className="text-gray-600">Enter your investment details manually if file upload doesn't work</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Investment Name</Label>
                    <Input
                      id="name"
                      value={manualEntry.name}
                      onChange={(e) => setManualEntry((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., SBI Blue Chip Fund, Reliance Industries"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={manualEntry.type}
                      onChange={(e) => setManualEntry((prev) => ({ ...prev, type: e.target.value as any }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="mutual_fund">Mutual Fund</option>
                      <option value="stock">Stock</option>
                      <option value="bond">Bond</option>
                      <option value="etf">ETF</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invested">Invested Amount (₹)</Label>
                    <Input
                      id="invested"
                      type="number"
                      step="0.01"
                      value={manualEntry.invested}
                      onChange={(e) => setManualEntry((prev) => ({ ...prev, invested: e.target.value }))}
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Value (₹)</Label>
                    <Input
                      id="current"
                      type="number"
                      step="0.01"
                      value={manualEntry.current}
                      onChange={(e) => setManualEntry((prev) => ({ ...prev, current: e.target.value }))}
                      placeholder="55000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Units/Quantity</Label>
                    <Input
                      id="units"
                      type="number"
                      step="0.001"
                      value={manualEntry.units}
                      onChange={(e) => setManualEntry((prev) => ({ ...prev, units: e.target.value }))}
                      placeholder="1000.50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Purchase Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={manualEntry.date}
                    onChange={(e) => setManualEntry((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Manual Entries List */}
          {portfolioEntries.filter((entry) => entry.source === "manual").length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Manual Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolioEntries
                    .filter((entry) => entry.source === "manual")
                    .map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {entry.type.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>Invested: ₹{entry.invested.toLocaleString("en-IN")}</span>
                            <span>Current: ₹{entry.current.toLocaleString("en-IN")}</span>
                            <span className={entry.current - entry.invested >= 0 ? "text-green-600" : "text-red-600"}>
                              {entry.current - entry.invested >= 0 ? "+" : ""}₹
                              {(entry.current - entry.invested).toLocaleString("en-IN")} (
                              {(((entry.current - entry.invested) / entry.invested) * 100).toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removePortfolioEntry(entry.id)}>
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
          {portfolioEntries.length > 0 ? (
            <PortfolioDashboard entries={portfolioEntries} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolio Data</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Upload your real investment statements or add entries manually to see comprehensive portfolio
                  analysis.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setActiveTab("upload")} variant="default">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Real Files
                  </Button>
                  <Button onClick={() => setActiveTab("manual")} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manually
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
