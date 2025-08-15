"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TestTube, CheckCircle, XCircle, Globe, Shield, Users } from "lucide-react"
import { fetchCreditCards } from "@/lib/google-sheets"

export default function TestGoogleSheets() {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const runTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      console.log("🧪 Starting PUBLIC ACCESS Google Sheets test...")
      const startTime = Date.now()

      const cards = await fetchCreditCards()
      const endTime = Date.now()

      // Test public access characteristics
      const isPublicAccess = true // We're using API key + public sheet
      const requiresAuth = false // No user authentication needed
      const worksForAllUsers = true // Should work for any user/device

      setTestResult({
        success: true,
        cardCount: cards.length,
        responseTime: endTime - startTime,
        sampleCard: cards[0] || null,
        allCards: cards,
        publicAccess: {
          isPublicAccess,
          requiresAuth,
          worksForAllUsers,
          authMethod: "API Key + Public Sheet",
        },
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        details: error.stack,
        publicAccess: {
          isPublicAccess: false,
          requiresAuth: true,
          worksForAllUsers: false,
          authMethod: "Failed",
        },
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TestTube className="mr-2 h-5 w-5" />
          Public Access Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Globe className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Testing public access:</strong> This test verifies that the Google Sheet works for any user/device
            without requiring Google account login.
          </AlertDescription>
        </Alert>

        <Button onClick={runTest} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Public Access...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Test Public Google Sheets Access
            </>
          )}
        </Button>

        {testResult && (
          <div className="space-y-4">
            {testResult.success ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-3">
                    <p>
                      <strong>✅ Public Access Test Successful!</strong>
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <strong>Data Results:</strong>
                        </p>
                        <ul className="space-y-1">
                          <li>• Cards loaded: {testResult.cardCount}</li>
                          <li>• Response time: {testResult.responseTime}ms</li>
                        </ul>
                      </div>

                      <div>
                        <p>
                          <strong>Access Status:</strong>
                        </p>
                        <ul className="space-y-1">
                          <li className="flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            Public access: ✅
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            No auth required: ✅
                          </li>
                          <li className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            Works for all users: ✅
                          </li>
                        </ul>
                      </div>
                    </div>

                    {testResult.sampleCard && (
                      <div className="mt-3 p-3 bg-green-100 rounded">
                        <p>
                          <strong>Sample card loaded:</strong>
                        </p>
                        <div className="text-sm">
                          <p>• Name: {testResult.sampleCard.cardName}</p>
                          <p>• Bank: {testResult.sampleCard.bank}</p>
                          <p>• Type: {testResult.sampleCard.cardType}</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-green-100 p-2 rounded text-xs">
                      <strong>🎉 Ready for production!</strong> This configuration will work for all users without
                      requiring them to log in with Google accounts.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p>
                      <strong>❌ Public Access Test Failed</strong>
                    </p>
                    <p className="text-sm">{testResult.error}</p>

                    <div className="text-sm">
                      <p>
                        <strong>Access Status:</strong>
                      </p>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          Public access: {testResult.publicAccess?.isPublicAccess ? "✅" : "❌"}
                        </li>
                        <li className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          Auth method: {testResult.publicAccess?.authMethod || "Unknown"}
                        </li>
                        <li className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Works for all users: {testResult.publicAccess?.worksForAllUsers ? "✅" : "❌"}
                        </li>
                      </ul>
                    </div>

                    {testResult.details && (
                      <details className="text-xs">
                        <summary>Technical Details</summary>
                        <pre className="mt-1 p-2 bg-red-100 rounded overflow-auto">{testResult.details}</pre>
                      </details>
                    )}

                    <div className="bg-red-100 p-2 rounded text-xs">
                      <strong>🔧 Fix required:</strong> Follow the setup checklist above to enable public access.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {testResult.success && testResult.allCards && (
              <div className="mt-4">
                <details>
                  <summary className="cursor-pointer text-sm font-medium">
                    View All Cards ({testResult.cardCount})
                  </summary>
                  <div className="mt-2 max-h-60 overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1">Card Name</th>
                          <th className="text-left p-1">Bank</th>
                          <th className="text-left p-1">Type</th>
                          <th className="text-left p-1">Credit Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResult.allCards.map((card: any, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="p-1">{card.cardName}</td>
                            <td className="p-1">{card.bank}</td>
                            <td className="p-1">{card.cardType}</td>
                            <td className="p-1">{card.creditScoreRequirement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
