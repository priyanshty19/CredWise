"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, FileText, TrendingUp, AlertCircle } from "lucide-react"
import { uploadPortfolioFile, addManualEntry, calculatePortfolioSummary } from "@/app/actions/portfolio-actions"
import type { PortfolioEntry, PortfolioSummary } from "@/app/actions/portfolio-actions"
import PortfolioDashboard from "./portfolio-dashboard"

interface PortfolioAnalysisProps {
  onDataUpdate?: (entries: PortfolioEntry[], summary: PortfolioSummary) => void
}

export default function PortfolioAnalysis({ onDataUpdate }: PortfolioAnalysisProps) {
  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<string[]>([])
  const [isAddingManual, setIsAddingManual] = useState(false)

  const updatePortfolioData = useCallback(
    (entries: PortfolioEntry[]) => {
      const summary = calculatePortfolioSummary(entries)
      setPortfolioEntries(entries)
      onDataUpdate?.(entries, summary)
    },
    [onDataUpdate],
  )

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const results: string[] = []
    let allNewEntries: PortfolioEntry[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const result = await uploadPortfolioFile(formData)

        if (result.success && result.data) {
          allNewEntries = [...allNewEntries, ...result.data]
          results.push(
            `✅ ${file.name}: Successfully parsed ${result.data.length} entries${
              result.summary?.broker ? ` (${result.summary.broker})` : ""
            }${result.summary?.detectedTableRange ? ` from ${result.summary.detectedTableRange}` : ""}`,
          )
        } else {
          results.push(`❌ ${file.name}: ${result.error || "Failed to parse file"}`)
        }
      } catch (error) {
        results.push(`❌ ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    // Update portfolio with all new entries
    const updatedEntries = [...portfolioEntries, ...allNewEntries]
    updatePortfolioData(updatedEntries)

    setUploadResults(results)
    setIsUploading(false)

    // Reset file input
    event.target.value = ""
  }

  const handleManualEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsAddingManual(true)

    const formData = new FormData(event.currentTarget)
    const result = await addManualEntry(formData)

    if (result.success && result.data) {
      const updatedEntries = [...portfolioEntries, result.data]
      updatePortfolioData(updatedEntries)

      // Reset form
      event.currentTarget.reset()
      setUploadResults([`✅ Manual Entry: Added "${result.data.name}" successfully`])
    } else {
      setUploadResults([`❌ Manual Entry: ${result.error || "Failed to add entry"}`])
    }

    setIsAddingManual(false)
  }

  const summary = calculatePortfolioSummary(portfolioEntries)

  return (
    <div className="space-y-6">
      {/* Upload and Entry Section */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Portfolio Files
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload CSV or Excel files from Groww, Zerodha, HDFC Securities, Angel One, Kuvera, Coin, or Paytm Money
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Choose files to upload</p>
                    <p className="text-sm text-gray-500">Supports CSV and Excel (.xlsx) files</p>
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      multiple
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>

                {isUploading && (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Processing files...</span>
                  </div>
                )}

                {/* Supported Formats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {["Groww", "Zerodha", "HDFC Sec", "Angel One", "Kuvera", "Coin", "Paytm Money", "Generic"].map(
                    (broker) => (
                      <Badge key={broker} variant="outline" className="justify-center">
                        {broker}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Manual Entry
              </CardTitle>
              <p className="text-sm text-gray-600">Manually add investments that aren't in your uploaded files</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Investment Name</Label>
                    <Input id="name" name="name" placeholder="e.g., HDFC Top 100 Fund" required />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="bond">Bond</SelectItem>
                        <SelectItem value="etf">ETF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity/Units</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      step="0.001"
                      placeholder="100"
                      min="0.001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="avgPrice">Average Price (₹)</Label>
                    <Input
                      id="avgPrice"
                      name="avgPrice"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      min="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentPrice">Current Price (₹)</Label>
                    <Input
                      id="currentPrice"
                      name="currentPrice"
                      type="number"
                      step="0.01"
                      placeholder="55.00"
                      min="0.01"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isAddingManual} className="w-full">
                  {isAddingManual ? "Adding..." : "Add Investment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Section */}
      {uploadResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    result.startsWith("✅")
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Dashboard */}
      {portfolioEntries.length > 0 ? (
        <PortfolioDashboard portfolioEntries={portfolioEntries} summary={summary} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Portfolio Data Yet</h3>
            <p className="text-gray-500 text-center max-w-md">
              Upload your portfolio files or add manual entries to start analyzing your investments. We support files
              from all major Indian brokers and platforms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
