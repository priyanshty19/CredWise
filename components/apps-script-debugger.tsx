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
import { testGoogleAppsScriptConnection } from "@/lib/google-apps-script-submission"

export default function AppsScriptDebugger() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    error?: string
    responseTime?: number
  } | null>(null)
  const [customUrl, setCustomUrl] = useState("")
  const [customPayload, setCustomPayload] = useState(`{
  "monthlyIncome": "75000",
  "spendingCategories": ["dining", "travel", "shopping"],
  "monthlySpending": "30000",
  "currentCards": "2",
  "creditScore": "780",
  "preferredBanks": ["HDFC Bank", "ICICI Bank"],
  "joiningFeePreference": "low_fee"
}`)

  const runTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const result = await testGoogleAppsScriptConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testCustomEndpoint = async () => {
    if (!customUrl) return

    setIsLoading(true)
    setTestResult(null)

    const startTime = Date.now()

    try {
      const response = await fetch(customUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: customPayload,
      })

      const responseTime = Date.now() - startTime
      const responseText = await response.text()

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { rawResponse: responseText }
      }

      setTestResult({
        success: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        ...responseData,
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
            Google Apps Script Debugger
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

          {/* Quick Test */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Quick Connection Test</h4>
            <Button onClick={runTest} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Test Apps Script Connection
                </>
              )}
            </Button>
          </div>

          {/* Custom Endpoint Test */}
          <div className="space-y-4 border-t pt-6">
            <h4 className="font-medium text-gray-900">Custom Endpoint Test</h4>

            <div className="space-y-2">
              <Label htmlFor="custom-url">Apps Script URL</Label>
              <Input
                id="custom-url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-payload">Test Payload (JSON)</Label>
              <Textarea
                id="custom-payload"
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <Button
              onClick={testCustomEndpoint}
              disabled={isLoading || !customUrl}
              variant="outline"
              className="w-full bg-transparent"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Test Custom Endpoint
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
                    {testResult.success ? "✅ Connection Successful!" : "❌ Connection Failed"}
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

                  {testResult.success && (
                    <div className="text-green-700 text-sm">
                      Your Apps Script is properly configured and responding to requests.
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Troubleshooting Guide */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Troubleshooting Guide</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>Ensure your Apps Script is deployed as a web app with "Anyone" access</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>Check that the NEXT_PUBLIC_APPS_SCRIPT_URL environment variable is set</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>Verify your Google Sheet has the correct "Form-Submissions" tab</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>Test the script directly in the Apps Script editor</span>
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
            <Button variant="outline" size="sm" onClick={runTest} disabled={isLoading}>
              <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Retest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
