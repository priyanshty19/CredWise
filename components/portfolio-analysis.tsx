"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Plus, FileText, BarChart3, PieChart, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import {
  parsePortfolioFile,
  addManualEntry,
  type PortfolioEntry,
  calculatePortfolioSummary,
} from "@/app/actions/portfolio-actions"
import PortfolioDashboard from "@/components/portfolio-dashboard"

export default function PortfolioAnalysis() {
  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadStatus, setUploadStatus] = useState<{
    status: "idle" | "uploading" | "success" | "error"
    message?: string
    details?: any
  }>({ status: "idle" })

  const [isPending, startTransition] = useTransition()

  const handleFileUpload = async (formData: FormData) => {
    setUploadStatus({ status: "uploading", message: "Parsing your investment file..." })

    startTransition(async () => {
      try {
        const result = await parsePortfolioFile(formData)

        if (result.success && result.data) {
          setPortfolioEntries((prev) => [...prev, ...result.data])
          setUploadStatus({
            status: "success",
            message: `Successfully parsed ${result.data.length} investments from ${result.summary?.fileName}`,
            details: result.summary,
          })
          // Switch to dashboard tab after successful upload
          setTimeout(() => setActiveTab("dashboard"), 1000)
        } else {
          setUploadStatus({
            status: "error",
            message: result.error || "Failed to parse file",
          })
        }
      } catch (error) {
        setUploadStatus({
          status: "error",
          message: "An unexpected error occurred while parsing the file",
        })
      }
    })
  }

  const handleManualEntry = async (formData: FormData) => {
    startTransition(async () => {
      const result = await addManualEntry(formData)

      if (result.success && result.data) {
        setPortfolioEntries((prev) => [...prev, result.data])
        // Reset form
        const form = document.getElementById("manual-entry-form") as HTMLFormElement
        form?.reset()
      }
    })
  }

  const summary = calculatePortfolioSummary(portfolioEntries)

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Current Financial Portfolio & Analysis
          </CardTitle>
          <p className="text-gray-600">
            Upload your investment statements or manually add entries to analyze your portfolio performance
          </p>
        </CardHeader>
      </Card>

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
            <PieChart className="h-4 w-4" />
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
              <p className="text-sm text-gray-600">
                Supported formats: CSV files from Zerodha, Groww, HDFC Securities, Angel One, and other brokers
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={handleFileUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-lg font-medium cursor-pointer">
                      Choose investment statement file
                    </Label>
                    <p className="text-sm text-gray-500">CSV, Excel files up to 10MB</p>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="mt-2"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Parse File
                    </>
                  )}
                </Button>
              </form>

              {/* Upload Status */}
              {uploadStatus.status !== "idle" && (
                <Alert
                  className={
                    uploadStatus.status === "success"
                      ? "border-green-200 bg-green-50"
                      : uploadStatus.status === "error"
                        ? "border-red-200 bg-red-50"
                        : "border-blue-200 bg-blue-50"
                  }
                >
                  {uploadStatus.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {uploadStatus.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                  {uploadStatus.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}

                  <AlertDescription className="ml-2">
                    {uploadStatus.message}
                    {uploadStatus.details && (
                      <div className="mt-2 text-sm">
                        <strong>Broker:</strong> {uploadStatus.details.broker} |<strong> Investments:</strong>{" "}
                        {uploadStatus.details.totalInvestments} |<strong> Total Value:</strong> ₹
                        {uploadStatus.details.totalValue?.toLocaleString("en-IN")}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Supported Formats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Supported Broker Formats:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>• Zerodha Console CSV</div>
                  <div>• Groww Portfolio CSV</div>
                  <div>• HDFC Securities Holdings</div>
                  <div>• Angel One Portfolio</div>
                  <div>• Generic CSV format</div>
                  <div>• Excel files (basic support)</div>
                </div>
              </div>
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
              <p className="text-sm text-gray-600">Manually add individual investments to your portfolio</p>
            </CardHeader>
            <CardContent>
              <form id="manual-entry-form" action={handleManualEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Investment Name</Label>
                    <Input id="name" name="name" placeholder="e.g., Reliance Industries, SBI Bluechip Fund" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Investment Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equity">Equity/Stocks</SelectItem>
                        <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                        <SelectItem value="bond">Bonds</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity/Units</Label>
                    <Input id="quantity" name="quantity" type="number" step="0.001" placeholder="100" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avgPrice">Average Price (₹)</Label>
                    <Input id="avgPrice" name="avgPrice" type="number" step="0.01" placeholder="2500.00" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPrice">Current Price (₹)</Label>
                    <Input
                      id="currentPrice"
                      name="currentPrice"
                      type="number"
                      step="0.01"
                      placeholder="2750.00"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Investment
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {portfolioEntries.length > 0 ? (
            <PortfolioDashboard portfolioEntries={portfolioEntries} summary={summary} />
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <PieChart className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolio Data</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Upload your investment statements or add manual entries to see your portfolio analysis and insights.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => setActiveTab("upload")} variant="default">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                  <Button onClick={() => setActiveTab("manual")} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Manual Entry
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
