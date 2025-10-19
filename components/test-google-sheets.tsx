"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { testGoogleSheetsConnection } from "@/app/actions/google-sheets-actions"

export function TestGoogleSheets() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const testResult = await testGoogleSheetsConnection()
      setResult(testResult)
    } catch (error) {
      setResult({
        success: false,
        message: "Test failed with error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Google Sheets Connection</CardTitle>
        <CardDescription>Test the connection and fetch sample data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={loading}>
          {loading ? "Testing..." : "Run Test"}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className={`p-3 rounded ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              <p className="font-medium">{result.success ? "Success" : "Error"}</p>
              <p className="text-sm">{result.message}</p>
            </div>

            {result.data && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Sample Data:</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
