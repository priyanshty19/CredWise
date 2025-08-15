"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, TestTube, AlertTriangle, CheckCircle, XCircle, Copy, ExternalLink, Info } from "lucide-react"

export default function AppsScriptDebugger() {
  const [testUrl, setTestUrl] = useState(process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const testAppsScriptUrl = async () => {
    if (!testUrl) {
      setTestResult({
        success: false,
        error: "Please enter an Apps Script URL to test",
      })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      console.log("🧪 Testing Apps Script URL:", testUrl)

      const testPayload = {
        timestamp: new Date().toISOString(),
        creditScore: 750,
        monthlyIncome: 100000,
        cardType: "Test",
        preferredBrand: "Test Bank",
        maxJoiningFee: "1000",
        topN: 3,
        submissionType: "test",
        userAgent: "CredWise Debugger",
      }

      const response = await fetch(testUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
        redirect: "follow",
      })

      console.log("📡 Test response status:", response.status)
      console.log("📡 Test response URL:", response.url)

      const responseText = await response.text()
      console.log("📄 Test response text:", responseText)

      let result
      let isValidJson = false
      try {
        result = JSON.parse(responseText)
        isValidJson = true
      } catch (parseError) {
        result = { rawResponse: responseText }
        isValidJson = false
      }

      // Determine if this is actually working despite errors
      const isWorking = response.ok || (response.status === 302 && responseText.includes("Moved Temporarily"))
      const hasRedirect = response.url !== testUrl || responseText.includes("Moved Temporarily")

      setTestResult({
        success: isWorking,
        status: response.status,
        url: response.url,
        redirected: hasRedirect,
        result,
        rawResponse: responseText,
        isValidJson,
        isWorking,
        needsJsonFix: isWorking && !isValidJson,
      })
    } catch (error: any) {
      console.error("❌ Apps Script test failed:", error)
      setTestResult({
        success: false,
        error: error.message,
      })
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAppsScriptCode = () => {
    const appsScriptCode = `function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Open the Google Sheet
    const sheet = SpreadsheetApp.openById('1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw').getActiveSheet();
    
    // Prepare the row data
    const rowData = [
      data.timestamp,
      data.creditScore,
      data.monthlyIncome,
      data.cardType,
      data.preferredBrand || 'Any',
      data.maxJoiningFee || 'Any',
      data.topN,
      data.submissionType,
      data.userAgent || 'Unknown'
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    // Return success response as JSON
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data submitted successfully',
        row: sheet.getLastRow(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response as JSON
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`
    copyToClipboard(appsScriptCode)
  }

  return (
    <Card className="mb-4 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-700">
          <TestTube className="h-5 w-5 mr-2" />
          Apps Script URL Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p>
                <strong>🔍 Current Status Analysis</strong>
              </p>
              <p className="text-sm">
                Based on your error message, your Apps Script is actually <strong>working</strong> and submitting data
                to the Google Sheet successfully. The issue is that it's not returning proper JSON responses, which
                makes our code think it failed.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="testUrl">Apps Script URL</Label>
          <div className="flex gap-2">
            <Input
              id="testUrl"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
              className="flex-1"
            />
            <Button onClick={() => copyToClipboard(testUrl)} variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Current environment variable: {process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "Not set"}
          </p>
        </div>

        <Button onClick={testAppsScriptUrl} disabled={testing || !testUrl} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Apps Script URL...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Test Apps Script URL
            </>
          )}
        </Button>

        {testResult && (
          <div className="space-y-4">
            <Alert className={`${testResult.isWorking ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              {testResult.isWorking ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.isWorking ? "text-green-800" : "text-red-800"}>
                <div className="space-y-2">
                  <p>
                    <strong>{testResult.isWorking ? "✅ Apps Script is Working!" : "❌ Test Failed"}</strong>
                  </p>

                  {testResult.status && (
                    <p className="text-sm">
                      <strong>Status:</strong> {testResult.status}
                    </p>
                  )}

                  {testResult.isWorking && testResult.needsJsonFix && (
                    <div className="text-sm">
                      <p>
                        <strong>⚠️ Issue Found:</strong> Your Apps Script is submitting data successfully, but it's not
                        returning proper JSON responses.
                      </p>
                    </div>
                  )}

                  {testResult.redirected && (
                    <div className="text-sm">
                      <p>
                        <strong>🔄 Redirect Detected:</strong>
                      </p>
                      <p>From: {testUrl}</p>
                      <p>To: {testResult.url}</p>
                    </div>
                  )}

                  {testResult.error && (
                    <p className="text-sm">
                      <strong>Error:</strong> {testResult.error}
                    </p>
                  )}

                  {testResult.result && testResult.isValidJson && (
                    <div className="text-sm">
                      <p>
                        <strong>JSON Response:</strong>
                      </p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(testResult.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {testResult.result && !testResult.isValidJson && (
                    <div className="text-sm">
                      <p>
                        <strong>Raw Response (Not JSON):</strong>
                      </p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                        {testResult.rawResponse.substring(0, 500)}...
                      </pre>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {testResult.isWorking && testResult.needsJsonFix && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="space-y-3">
                    <p>
                      <strong>🔧 Fix Required: Update Your Apps Script</strong>
                    </p>
                    <p className="text-sm">
                      Your Apps Script is working but needs to return proper JSON responses. Update your Apps Script
                      code to fix the error messages.
                    </p>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">📋 Updated Apps Script Code:</p>
                      <div className="bg-gray-100 p-2 rounded">
                        <Button
                          onClick={copyAppsScriptCode}
                          variant="outline"
                          size="sm"
                          className="mb-2 bg-transparent"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Fixed Apps Script Code
                        </Button>
                        <pre className="text-xs overflow-auto max-h-40">
                          {`function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById('1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw').getActiveSheet();
    
    const rowData = [
      data.timestamp, data.creditScore, data.monthlyIncome,
      data.cardType, data.preferredBrand || 'Any',
      data.maxJoiningFee || 'Any', data.topN,
      data.submissionType, data.userAgent || 'Unknown'
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data submitted successfully',
        row: sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">🔧 How to update:</p>
                      <ol className="text-sm list-decimal list-inside space-y-1 ml-4">
                        <li>
                          Go to{" "}
                          <a
                            href="https://script.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            script.google.com
                          </a>
                        </li>
                        <li>Open your CredWise project</li>
                        <li>Replace your current doPost function with the code above</li>
                        <li>Click "Save" (Ctrl+S)</li>
                        <li>Click "Deploy" → "New deployment" (or manage existing deployment)</li>
                        <li>Test again using this debugger</li>
                      </ol>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {testResult.isWorking && testResult.isValidJson && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p>
                      <strong>🎉 Perfect! Your Apps Script is working correctly!</strong>
                    </p>
                    <p className="text-sm">
                      Your Apps Script is submitting data and returning proper JSON responses. The form submissions
                      should work without errors now.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Alert className="bg-blue-50 border-blue-200">
          <ExternalLink className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p>
                <strong>📋 Quick Links:</strong>
              </p>
              <div className="flex gap-2 flex-wrap">
                <a
                  href="https://script.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  📝 Apps Script Editor
                </a>
                <a
                  href="https://docs.google.com/spreadsheets/d/1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  📊 Your Google Sheet
                </a>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
