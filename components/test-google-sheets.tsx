"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Loader2, Database, ExternalLink } from "lucide-react"
import { testGoogleSheetsConnection } from "@/app/actions/google-sheets-actions"

interface SheetData {
  range: string
  majorDimension: string
  values: string[][]
}

export default function TestGoogleSheets() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    data?: SheetData
    error?: string
    totalCards?: number
  } | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const testResult = await testGoogleSheetsConnection()
      setResult(testResult)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Google Sheets API Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Test your Google Sheets API connection and verify that the card database is accessible.
          </p>

          <Button onClick={testConnection} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Test Google Sheets Connection
              </>
            )}
          </Button>

          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div className="space-y-2">
                    <div className="font-medium text-green-800">✅ Connection Successful!</div>
                    <div className="text-green-700">
                      Successfully retrieved {result.totalCards} rows of data from Google Sheets.
                    </div>
                    {result.data && result.data.values && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-green-800 mb-2">Sample Data:</div>
                        <div className="bg-white rounded border p-2 text-xs font-mono">
                          {result.data.values.slice(0, 3).map((row, index) => (
                            <div key={index} className="truncate">
                              {row.join(" | ")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-800">
                    <div className="font-medium">❌ Connection Failed</div>
                    <div className="mt-1">{result.error}</div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-gray-900 mb-2">Setup Checklist:</h4>
            <div className="space-y-1 text-gray-600">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  ENV
                </Badge>
                <span>GOOGLE_SHEETS_API_KEY is set (server-side)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  API
                </Badge>
                <span>Google Sheets API is enabled in Google Cloud Console</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  SHEET
                </Badge>
                <span>Google Sheet is publicly accessible</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://console.cloud.google.com/apis/library/sheets.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Google Cloud Console
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
