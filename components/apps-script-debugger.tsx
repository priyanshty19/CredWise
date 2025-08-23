"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, AlertCircle, Loader2, Code, Send, Clock, ExternalLink, Copy, RefreshCw } from "lucide-react"

export default function AppsScriptDebugger() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    error?: string
    responseTime?: number
    response?: any
  } | null>(null)
  const [customUrl, setCustomUrl] = useState("")
  const [customPayload, setCustomPayload] = useState(`{
  "monthlyIncome": 75000,
  "monthlySpending": 35000,
  "creditScoreRange": "750-850",
  "currentCards": "2",
  "spendingCategories": "dining, travel, shopping",
  "preferredBanks": "HDFC Bank, ICICI Bank",
  "joiningFeePreference": "low_fee",
  "submissionType": "enhanced_form",
  "userAgent": "Test User Agent"
}`)

  const testEnhancedFormSubmission = async () => {
    setIsLoading(true)
    setTestResult(null)

    const startTime = Date.now()

    try {
      const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || customUrl

      if (!appsScriptUrl) {
        throw new Error("Apps Script URL not configured")
      }

      console.log("🔗 Testing Apps Script URL:", appsScriptUrl)
      console.log("📦 Test payload:", customPayload)

      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: customPayload,
      })

      const responseTime = Date.now() - startTime
      const responseText = await response.text()

      console.log("📡 Response status:", response.status)
      console.log("📄 Response text:", responseText)

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { rawResponse: responseText }
      }

      setTestResult({
        success: response.ok && responseData.success !== false,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        response: responseData,
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Request failed",
        responseTime: Date.now() - startTime,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const currentAppsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "Not configured"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Enhanced Form Apps Script Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Configuration */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Configuration</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Apps Script URL:</span>
                <div className="flex items-center gap-2">
                  <Badge variant={currentAppsScriptUrl !== "Not configured" ? "default" : "destructive"}>
                    {currentAppsScriptUrl !== "Not configured" ? "Configured" : "Missing"}
                  </Badge>
                  {currentAppsScriptUrl !== "Not configured" && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentAppsScriptUrl)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {currentAppsScriptUrl !== "Not configured" && (
                <div className="text-xs text-gray-500 break-all bg-white p-2 rounded border">
                  {currentAppsScriptUrl}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Form Test */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Enhanced Form Structure Test</h4>

            <div className="space-y-2">
              <Label htmlFor="custom-url">Apps Script URL (if different from env)</Label>
              <Input
                id="custom-url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-payload">Enhanced Form Test Payload (JSON)</Label>
              <Textarea
                id="custom-payload"
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <Button onClick={testEnhancedFormSubmission} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Enhanced Form Submission...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Test Enhanced Form Apps Script
                </>
              )}
            </Button>
          </div>

          {/* Test Results */}
          {testResult && (
            <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <div className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
                    {testResult.success ? "✅ Enhanced Form Test Successful!" : "❌ Enhanced Form Test Failed"}
                  </div>

                  {testResult.responseTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>Response time: {testResult.responseTime}ms</span>
                    </div>
                  )}

                  {testResult.error && (
                    <div className="text-red-700 text-sm">
                      <strong>Error:</strong> {testResult.error}
                    </div>
                  )}

                  {testResult.response && (
                    <div className="text-sm">
                      <strong>Response:</strong>
                      <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-auto">
                        {JSON.stringify(testResult.response, null, 2)}
                      </pre>
                    </div>
                  )}

                  {testResult.success && (
                    <div className="text-green-700 text-sm">
                      Your Apps Script is properly handling the enhanced form structure. Check your Google Sheet for the
                      new data!
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Updated Field Mapping */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Enhanced Form Field Mapping</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <div>
                <strong>A:</strong> Timestamp (auto-generated)
              </div>
              <div>
                <strong>B:</strong> Monthly Income (monthlyIncome)
              </div>
              <div>
                <strong>C:</strong> Monthly Credit Card Spending (monthlySpending)
              </div>
              <div>
                <strong>D:</strong> Credit Score Range (creditScoreRange)
              </div>
              <div>
                <strong>E:</strong> Current Cards Count (currentCards)
              </div>
              <div>
                <strong>F:</strong> Spending Categories (spendingCategories)
              </div>
              <div>
                <strong>G:</strong> Preferred Banks (preferredBanks)
              </div>
              <div>
                <strong>H:</strong> Joining Fee Preference (joiningFeePreference)
              </div>
              <div>
                <strong>I:</strong> Submission Type (submissionType)
              </div>
              <div>
                <strong>J:</strong> User Agent (userAgent)
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://script.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-2" />
                Apps Script Console
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://docs.google.com/spreadsheets/d/1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw/edit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                View Google Sheet
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={testEnhancedFormSubmission} disabled={isLoading}>
              <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Retest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
