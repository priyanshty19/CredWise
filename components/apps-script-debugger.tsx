"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, CheckCircle, XCircle, Code } from "lucide-react"

export default function AppsScriptDebugger() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testData, setTestData] = useState({
    monthlyIncome: 50000,
    spendingCategories: ["Online Shopping", "Dining"],
    preferredBanks: ["HDFC Bank", "ICICI Bank"],
    maxAnnualFee: 2500,
    cardType: "Cashback",
    topRecommendation: "SBI Cashback Card",
    totalRecommendations: 5,
  })

  const testAppsScript = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

      if (!appsScriptUrl) {
        throw new Error("Apps Script URL not found in environment variables")
      }

      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...testData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      })

      const responseText = await response.text()

      try {
        const jsonResult = JSON.parse(responseText)
        setResult({
          status: response.status,
          success: response.ok,
          data: jsonResult,
          rawResponse: responseText,
        })
      } catch {
        setResult({
          status: response.status,
          success: response.ok,
          data: null,
          rawResponse: responseText,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const updateTestData = (field: string, value: any) => {
    setTestData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Apps Script Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthlyIncome">Monthly Income</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={testData.monthlyIncome}
                onChange={(e) => updateTestData("monthlyIncome", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="maxAnnualFee">Max Annual Fee</Label>
              <Input
                id="maxAnnualFee"
                type="number"
                value={testData.maxAnnualFee}
                onChange={(e) => updateTestData("maxAnnualFee", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="spendingCategories">Spending Categories (comma-separated)</Label>
              <Input
                id="spendingCategories"
                value={testData.spendingCategories.join(", ")}
                onChange={(e) => updateTestData("spendingCategories", e.target.value.split(", "))}
              />
            </div>
            <div>
              <Label htmlFor="preferredBanks">Preferred Banks (comma-separated)</Label>
              <Input
                id="preferredBanks"
                value={testData.preferredBanks.join(", ")}
                onChange={(e) => updateTestData("preferredBanks", e.target.value.split(", "))}
              />
            </div>
            <div>
              <Label htmlFor="cardType">Card Type</Label>
              <Input
                id="cardType"
                value={testData.cardType}
                onChange={(e) => updateTestData("cardType", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="topRecommendation">Top Recommendation</Label>
              <Input
                id="topRecommendation"
                value={testData.topRecommendation}
                onChange={(e) => updateTestData("topRecommendation", e.target.value)}
              />
            </div>
          </div>

          <Button onClick={testAppsScript} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Apps Script...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Test Apps Script Submission
              </>
            )}
          </Button>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">Response Status: {result.status}</span>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Failed"}
                </Badge>
              </div>

              {result.data && (
                <div>
                  <Label>Parsed Response:</Label>
                  <Textarea
                    value={JSON.stringify(result.data, null, 2)}
                    readOnly
                    className="mt-1 font-mono text-sm"
                    rows={6}
                  />
                </div>
              )}

              <div>
                <Label>Raw Response:</Label>
                <Textarea value={result.rawResponse} readOnly className="mt-1 font-mono text-sm" rows={4} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
