"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Plus, FileText, PieChart, BarChart3, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { uploadPortfolioFiles } from "@/app/actions/portfolio-actions"
import PortfolioDashboard from "@/components/portfolio-dashboard"

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

interface UploadedFile {
  name: string
  status: "uploading" | "processing" | "completed" | "error"
  entriesCount?: number
  error?: string
}

export default function PortfolioAnalysis() {
  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")

  // Manual entry form state
  const [manualEntry, setManualEntry] = useState({
    name: "",
    type: "mutual_fund" as const,
    amount: "",
    units: "",
    currentValue: "",
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const fileArray = Array.from(files)

    // Add files to uploaded files list with uploading status
    const newUploadedFiles = fileArray.map((file) => ({
      name: file.name,
      status: "uploading" as const,
    }))
    setUploadedFiles((prev) => [...prev, ...newUploadedFiles])

    try {
      // Update status to processing
      setUploadedFiles((prev) =>
        prev.map((f) =>
          newUploadedFiles.some((nf) => nf.name === f.name) ? { ...f, status: "processing" as const } : f,
        ),
      )

      const formData = new FormData()
      fileArray.forEach((file) => {
        formData.append("files", file)
      })

      const result = await uploadPortfolioFiles(formData)

      if (result.success && result.portfolioData) {
        // Add new entries to portfolio
        const newEntries: PortfolioEntry[] = result.portfolioData.map((entry) => ({
          ...entry,
          source: "upload" as const,
        }))

        setPortfolioEntries((prev) => [...prev, ...newEntries])

        // Update file status to completed
        setUploadedFiles((prev) =>
          prev.map((f) => {
            const matchingFile = newUploadedFiles.find((nf) => nf.name === f.name)
            if (matchingFile) {
              const entriesForFile = newEntries.filter((entry) => entry.fileName === f.name)
              return {
                ...f,
                status: "completed" as const,
                entriesCount: entriesForFile.length,
              }
            }
            return f
          }),
        )

        // Switch to dashboard tab if we have entries
        if (newEntries.length > 0) {
          setActiveTab("dashboard")
        }
      } else {
        // Update status to error
        setUploadedFiles((prev) =>
          prev.map((f) =>
            newUploadedFiles.some((nf) => nf.name === f.name)
              ? { ...f, status: "error" as const, error: result.error || "Upload failed" }
              : f,
          ),
        )
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadedFiles((prev) =>
        prev.map((f) =>
          newUploadedFiles.some((nf) => nf.name === f.name)
            ? { ...f, status: "error" as const, error: "Upload failed" }
            : f,
        ),
      )
    } finally {
      setIsUploading(false)
      // Clear the input
      event.target.value = ""
    }
  }

  const removeUploadedFile = (fileName: string) => {
    // Remove file from uploaded files
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName))
    // Remove associated portfolio entries
    setPortfolioEntries((prev) => prev.filter((entry) => entry.fileName !== fileName))
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = Number.parseFloat(manualEntry.amount)
    const units = Number.parseFloat(manualEntry.units) || 0
    const currentValue = Number.parseFloat(manualEntry.currentValue)

    if (!manualEntry.name || isNaN(amount) || isNaN(currentValue)) {
      return
    }

    const gainLoss = currentValue - amount
    const gainLossPercentage = (gainLoss / amount) * 100

    const newEntry: PortfolioEntry = {
      id: `manual-${Date.now()}`,
      name: manualEntry.name,
      type: manualEntry.type,
      amount,
      units: units > 0 ? units : undefined,
      currentValue,
      gainLoss,
      gainLossPercentage,
      source: "manual",
    }

    setPortfolioEntries((prev) => [...prev, newEntry])

    // Reset form
    setManualEntry({
      name: "",
      type: "mutual_fund",
      amount: "",
      units: "",
      currentValue: "",
    })

    // Switch to dashboard if this is the first entry
    if (portfolioEntries.length === 0) {
      setActiveTab("dashboard")
    }
  }

  const removePortfolioEntry = (id: string) => {
    setPortfolioEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case "uploading":
        return "Uploading..."
      case "processing":
        return "Processing..."
      case "completed":
        return `${file.entriesCount || 0} investments found`
      case "error":
        return file.error || "Error"
    }
  }

  return (
    <div className="space-y-6">
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
              <Badge variant="secondary" className="ml-1">
                {portfolioEntries.length}
              </Badge>
            )}
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
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">Drop your investment statements here</p>
                  <p className="text-sm text-gray-600">Supports Excel (.xlsx), CSV, and PDF files</p>
                </div>
                <div className="mt-6">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button disabled={isUploading} className="relative">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Files
                        </>
                      )}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.csv,.pdf"
                      onChange={handleFileUpload}
                      className="sr-only"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded Files Status */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {getStatusIcon(file.status)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-600">{getStatusText(file)}</p>
                        </div>
                      </div>
                      {file.status === "completed" || file.status === "error" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(file.name)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : null}
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
                <Plus className="h-5 w-5" />
                Add Investment Manually
              </CardTitle>
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
                      placeholder="e.g., HDFC Top 100 Fund"
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
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Invested Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={manualEntry.amount}
                      onChange={(e) => setManualEntry((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Units (Optional)</Label>
                    <Input
                      id="units"
                      type="number"
                      step="0.001"
                      value={manualEntry.units}
                      onChange={(e) => setManualEntry((prev) => ({ ...prev, units: e.target.value }))}
                      placeholder="1250.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentValue">Current Value (₹)</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      step="0.01"
                      value={manualEntry.currentValue}
                      onChange={(e) => setManualEntry((prev) => ({ ...prev, currentValue: e.target.value }))}
                      placeholder="55000"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
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
                            <span>Invested: ₹{entry.amount.toLocaleString()}</span>
                            <span>Current: ₹{entry.currentValue.toLocaleString()}</span>
                            <span className={entry.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                              {entry.gainLoss >= 0 ? "+" : ""}₹{entry.gainLoss.toLocaleString()}(
                              {entry.gainLossPercentage.toFixed(2)}%)
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
            <PortfolioDashboard portfolioEntries={portfolioEntries} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <PieChart className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolio Data</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Upload your investment statements or add entries manually to see your portfolio analysis.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setActiveTab("upload")} variant="default">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
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
