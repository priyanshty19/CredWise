"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle, Loader2, AlertTriangle, Globe } from "lucide-react"
import { fetchCreditCards } from "@/lib/google-sheets"
import { submitUserDataToGoogleSheets, getSubmissionAnalytics } from "@/lib/google-sheets-submissions"

interface ConnectionStatus {
  status: "loading" | "connected" | "error" | "warning"
  cardCount: number
  error: string
  details?: string
  cardTypeDistribution?: Record<string, number>
  bankCount?: number
  responseTime?: number
  isPublicAccess?: boolean
  bankList?: string[] // Add this new field
}

interface SubmissionsStatus {
  status: "loading" | "connected" | "error" | "testing"
  error: string
  details?: string
  canWrite?: boolean
  canRead?: boolean
  totalSubmissions?: number
  lastTestResult?: any
}

export default function GoogleSheetsStatus() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: "loading",
    cardCount: 0,
    error: "",
  })

  const [submissionsStatus, setSubmissionsStatus] = useState<SubmissionsStatus>({
    status: "loading",
    error: "",
  })

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("🔄 Testing Google Sheets PUBLIC ACCESS connection...")
        const startTime = Date.now()
        const cards = await fetchCreditCards()
        const endTime = Date.now()
        const responseTime = endTime - startTime

        // Calculate statistics
        const cardTypeDistribution = cards.reduce(
          (acc, card) => {
            acc[card.cardType] = (acc[card.cardType] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        const uniqueBanks = new Set(cards.map((card) => card.bank)).size
        const bankList = [...new Set(cards.map((card) => card.bank))].sort()

        console.log("🏦 UNIQUE BANKS IN SHEET:", bankList)

        if (cards.length === 0) {
          setConnectionStatus({
            status: "warning",
            cardCount: 0,
            error: "Connected but no cards found",
            details:
              "The sheet is accessible but contains no valid card data. Please check your sheet structure and data.",
            responseTime,
            isPublicAccess: true,
          })
        } else {
          setConnectionStatus({
            status: "connected",
            cardCount: cards.length,
            error: "",
            details: `Public access verified in ${responseTime}ms`,
            cardTypeDistribution,
            bankCount: uniqueBanks,
            responseTime,
            isPublicAccess: true,
            bankList, // Add this new field
          })
        }
      } catch (err: any) {
        console.error("❌ Public access test failed:", err)
        setConnectionStatus({
          status: "error",
          cardCount: 0,
          error: err.message || "Failed to connect to Google Sheets with public access",
          details: "Please check the troubleshooting guide below.",
          isPublicAccess: false,
        })
      }
    }

    const checkSubmissionsConnection = async () => {
      try {
        console.log("🔄 Testing Google Sheets submissions connectivity...")

        // First, verify the sheet structure
        const structureUrl = `https://sheets.googleapis.com/v4/spreadsheets/1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw/values/Sheet1!A1:I1?key=${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY}`

        const structureResponse = await fetch(structureUrl)

        if (!structureResponse.ok) {
          throw new Error(`Failed to access sheet structure: ${structureResponse.status}`)
        }

        const structureData = await structureResponse.json()
        const headers = structureData.values?.[0] || []

        console.log("📋 Found headers in sheet:", headers)

        // Expected headers
        const expectedHeaders = [
          "Timestamp",
          "Credit Score",
          "Monthly Income",
          "Card Type",
          "Preferred Brand",
          "Max Joining Fee",
          "Number of Recommendations",
          "Submission Type",
          "User Agent",
        ]

        // Verify headers match
        const headersMatch = expectedHeaders.every(
          (expected, index) => headers[index] && headers[index].trim() === expected,
        )

        console.log("🔍 Header verification:")
        expectedHeaders.forEach((expected, index) => {
          const actual = headers[index]
          const match = actual && actual.trim() === expected
          console.log(
            `   Column ${String.fromCharCode(65 + index)}: ${match ? "✅" : "❌"} Expected: "${expected}", Found: "${actual || "MISSING"}"`,
          )
        })

        if (!headersMatch) {
          setSubmissionsStatus({
            status: "error",
            error: "Sheet headers don't match expected format",
            details: `Expected: ${expectedHeaders.join(", ")}\nFound: ${headers.join(", ")}`,
            canRead: true,
            canWrite: false,
          })
          return
        }

        // Test read access with analytics
        const analytics = await getSubmissionAnalytics()
        console.log("✅ Read access successful:", analytics)

        setSubmissionsStatus({
          status: "connected",
          error: "",
          details: `✅ Sheet structure verified! Using Google Apps Script for submissions. Found ${analytics.totalSubmissions} existing submissions.`,
          canRead: true,
          canWrite: true, // Apps Script handles write operations
          totalSubmissions: analytics.totalSubmissions,
        })
      } catch (error: any) {
        console.error("❌ Submissions sheet test failed:", error)
        setSubmissionsStatus({
          status: "error",
          error: error.message || "Failed to connect to submissions sheet",
          details: "Please check sheet permissions and API configuration",
          canRead: false,
          canWrite: false,
        })
      }
    }

    checkConnection()
    checkSubmissionsConnection()
  }, [])

  const testSubmission = async () => {
    setSubmissionsStatus((prev) => ({ ...prev, status: "testing" }))

    try {
      console.log("🧪 Testing comprehensive form submission...")

      const testData = {
        creditScore: 750,
        monthlyIncome: 100000,
        cardType: "Cashback",
        preferredBrand: "HDFC Bank",
        maxJoiningFee: 1000,
        topN: 3,
        timestamp: new Date().toISOString(),
        userAgent: "Test Browser - CredWise Form Test",
        submissionType: "enhanced" as const,
      }

      console.log("📊 Test data being submitted:", testData)

      const result = await submitUserDataToGoogleSheets(testData)
      console.log("✅ Test submission result:", result)

      // Wait a moment for the data to be written
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Refresh analytics to show the new submission
      const updatedAnalytics = await getSubmissionAnalytics()
      console.log("📊 Updated analytics after test:", updatedAnalytics)

      setSubmissionsStatus((prev) => ({
        ...prev,
        status: "connected",
        details: `✅ Test submission successful! New row added to your sheet. Total submissions: ${updatedAnalytics.totalSubmissions}`,
        canWrite: true,
        totalSubmissions: updatedAnalytics.totalSubmissions,
        lastTestResult: {
          ...testData,
          success: true,
          rowsAfterTest: updatedAnalytics.totalSubmissions,
        },
      }))
    } catch (error: any) {
      console.error("❌ Test submission failed:", error)
      setSubmissionsStatus((prev) => ({
        ...prev,
        status: "error",
        error: error.message || "Test submission failed",
        details: "Check console for detailed error information. Most likely a permissions issue.",
        canWrite: false,
        lastTestResult: {
          success: false,
          error: error.message,
        },
      }))
    }
  }

  if (connectionStatus.status === "loading") {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          <div className="space-y-2">
            <p>🔗 Connecting to Google Sheets with public access...</p>
            <div className="text-xs text-gray-500">Testing authentication-free access to Card-Data tab...</div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (connectionStatus.status === "error") {
    return (
      <div className="mb-4 space-y-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>❌ Public Google Sheets access failed:</strong>
              </p>
              <p className="text-sm">{connectionStatus.error}</p>
              {connectionStatus.details && <p className="text-xs">{connectionStatus.details}</p>}
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-3">
              <p>
                <strong>🔧 Public Access Setup Checklist:</strong>
              </p>

              <div className="space-y-2">
                <p>
                  <strong>1. Google Sheet Sharing Settings:</strong>
                </p>
                <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                  <li>Open your Google Sheet</li>
                  <li>Click "Share" button (top right)</li>
                  <li>Click "Change to anyone with the link"</li>
                  <li>Set permission to "Viewer"</li>
                  <li>Click "Done"</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>2. Google Cloud Console API Setup:</strong>
                </p>
                <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                  <li>Enable Google Sheets API</li>
                  <li>Create API Key (not OAuth credentials)</li>
                  <li>Remove any IP/domain restrictions</li>
                  <li>Add API key to NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>3. Sheet Structure:</strong>
                </p>
                <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                  <li>Tab must be named "Card-Data"</li>
                  <li>Headers in row 1 (A1:K1)</li>
                  <li>Data starting from row 2</li>
                </ul>
              </div>

              <div className="bg-yellow-100 p-2 rounded text-xs">
                <strong>🧪 Test from incognito/private browser window to verify public access!</strong>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (connectionStatus.status === "warning") {
    return (
      <Alert className="mb-4 bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <div className="space-y-2">
            <p>
              <strong>⚠️ Google Sheets connected but no data found</strong>
            </p>
            <p className="text-sm">{connectionStatus.details}</p>
            {connectionStatus.isPublicAccess && (
              <div className="flex items-center text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Public access verified
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="mb-4 space-y-4">
      {/* COMMENTED OUT - Google Sheets Connection Status
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>
                <Database className="inline h-4 w-4 mr-1" />
                <strong>✅ Google Sheets connected!</strong> {connectionStatus.cardCount} credit cards loaded.
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-100 px-2 py-1 rounded">LIVE DATA</span>
                {connectionStatus.isPublicAccess && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    PUBLIC ACCESS
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm flex items-center justify-between">
              <span className="text-green-700">
                📊 {connectionStatus.bankCount} banks • {connectionStatus.details}
              </span>
              {connectionStatus.responseTime && (
                <span className="text-xs text-green-600">⚡ {connectionStatus.responseTime}ms</span>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
      */}

      {/* COMMENTED OUT - Card Type Distribution
      {connectionStatus.cardTypeDistribution && (
        <Alert className="bg-blue-50 border-blue-200">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p>
                <strong>📊 Card Type Distribution:</strong>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                {Object.entries(connectionStatus.cardTypeDistribution).map(([type, count]) => (
                  <div key={type} className="bg-blue-100 px-2 py-1 rounded text-center">
                    <div className="font-medium">{type}</div>
                    <div className="text-xs">{count} cards</div>
                  </div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      */}

      {/* COMMENTED OUT - Bank List from Sheet
      {connectionStatus.bankList && (
        <Alert className="bg-indigo-50 border-indigo-200">
          <Building2 className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-indigo-800">
            <div className="space-y-2">
              <p>
                <strong>🏦 Banks Available in Your Sheet:</strong>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-sm">
                {connectionStatus.bankList.map((bank, index) => (
                  <div key={index} className="bg-indigo-100 px-2 py-1 rounded text-center">
                    {bank}
                  </div>
                ))}
              </div>
              <div className="text-xs bg-indigo-100 p-2 rounded">
                💡 These exact values will appear in the bank filter dropdown
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      */}

      {/* COMMENTED OUT - Public Access Verification
      <Alert className="bg-purple-50 border-purple-200">
        <Shield className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <div className="space-y-2">
            <p>
              <strong>🔒 Authentication Status:</strong>
            </p>
            <div className="text-sm space-y-1">
              <div className="flex items-center">
                <Globe className="h-3 w-3 mr-2" />
                <span>✅ Public sheet access (no login required)</span>
              </div>
              <div className="flex items-center">
                <Database className="h-3 w-3 mr-2" />
                <span>✅ API key authentication working</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-2" />
                <span>✅ Works for all users/devices</span>
              </div>
            </div>
            <div className="text-xs bg-purple-100 p-2 rounded">
              💡 This setup works for any user without requiring Google account login
            </div>
          </div>
        </AlertDescription>
      </Alert>
      */}

      {/* COMMENTED OUT - Submissions Sheet Status
      {submissionsStatus.status === "loading" && (
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <div>
                <p className="font-medium">Testing Submissions Sheet Connection...</p>
                <p className="text-sm text-gray-500">Checking read/write access to your Google Sheet</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {submissionsStatus.status === "error" && (
        <Card className="mb-4 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <XCircle className="h-5 w-5 mr-2" />
              Submissions Sheet Connection Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Error:</strong> {submissionsStatus.error}
                  </p>
                  {submissionsStatus.details && <p className="text-sm">{submissionsStatus.details}</p>}
                </div>
              </AlertDescription>
            </Alert>

            <Alert className="bg-blue-50 border-blue-200">
              <Database className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-3">
                  <p>
                    <strong>🔧 Setup Checklist for Submissions Sheet:</strong>
                  </p>

                  <div className="space-y-2">
                    <p>
                      <strong>1. Google Apps Script Setup:</strong>
                    </p>
                    <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                      <li>Apps Script deployed as web app</li>
                      <li>NEXT_PUBLIC_APPS_SCRIPT_URL configured</li>
                      <li>Script has access to your Google Sheet</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <strong>2. Sheet Permissions:</strong>
                    </p>
                    <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                      <li>
                        Open:{" "}
                        <a
                          href="https://docs.google.com/spreadsheets/d/1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw/edit"
                          target="_blank"
                          className="text-blue-600 underline"
                          rel="noreferrer"
                        >
                          Your Submissions Sheet
                        </a>
                      </li>
                      <li>
                        Click "Share" → "Anyone with the link can <strong>edit</strong>"
                      </li>
                      <li>⚠️ Must be "edit" not just "view" for submissions to work</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <strong>3. API Configuration:</strong>
                    </p>
                    <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                      <li>Google Sheets API enabled in Cloud Console</li>
                      <li>API key configured: NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY</li>
                      <li>No IP/domain restrictions on API key</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-100 p-2 rounded text-xs">
                    <strong>💡 Quick Fix:</strong> The most common issue is sheet permissions. Make sure your sheet
                    allows "Anyone with the link can edit"
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => setSubmissionsStatus({ ...submissionsStatus, status: "loading" })}
              variant="outline"
              className="w-full"
            >
              <Database className="mr-2 h-4 w-4" />
              Retry Connection Test
            </Button>
          </CardContent>
        </Card>
      )}

      {submissionsStatus.status === "connected" && (
        <Card className="mb-4 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="h-5 w-5 mr-2" />
              Submissions Sheet Connected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Database className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p>
                    <strong>✅ Connection Status:</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>• Read Access: {submissionsStatus.canRead ? "✅ Working" : "❌ Failed"}</p>
                      <p>• Write Access: {submissionsStatus.canWrite ? "✅ Working" : "❌ Failed"}</p>
                    </div>
                    <div>
                      <p>• Total Submissions: {submissionsStatus.totalSubmissions || 0}</p>
                      <p>• Sheet ID: ...{submissionsStatus.error ? "Error" : "Connected"}</p>
                    </div>
                  </div>
                  {submissionsStatus.details && <p className="text-xs mt-2">{submissionsStatus.details}</p>}
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={testSubmission} disabled={submissionsStatus.status === "testing"} className="flex-1">
                {submissionsStatus.status === "testing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Submission...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Form Submission
                  </>
                )}
              </Button>

              <Button
                onClick={() => setSubmissionsStatus({ ...submissionsStatus, status: "loading" })}
                variant="outline"
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
            </div>

            {submissionsStatus.lastTestResult && (
              <Alert
                className={`${submissionsStatus.lastTestResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <Users
                  className={`h-4 w-4 ${submissionsStatus.lastTestResult.success ? "text-green-600" : "text-red-600"}`}
                />
                <AlertDescription
                  className={submissionsStatus.lastTestResult.success ? "text-green-800" : "text-red-800"}
                >
                  <div className="space-y-2">
                    <p>
                      <strong>
                        {submissionsStatus.lastTestResult.success
                          ? "🧪 Test Submission Successful!"
                          : "❌ Test Submission Failed"}
                      </strong>
                    </p>
                    {submissionsStatus.lastTestResult.success ? (
                      <div className="text-xs space-y-1">
                        <p>• Credit Score: {submissionsStatus.lastTestResult.creditScore}</p>
                        <p>• Monthly Income: ₹{submissionsStatus.lastTestResult.monthlyIncome.toLocaleString()}</p>
                        <p>• Card Type: {submissionsStatus.lastTestResult.cardType}</p>
                        <p>• Preferred Brand: {submissionsStatus.lastTestResult.preferredBrand}</p>
                        <p>• Submission Type: {submissionsStatus.lastTestResult.submissionType}</p>
                        <p>• Timestamp: {new Date(submissionsStatus.lastTestResult.timestamp).toLocaleString()}</p>
                        {submissionsStatus.lastTestResult.rowsAfterTest && (
                          <p>• Total Rows in Sheet: {submissionsStatus.lastTestResult.rowsAfterTest}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs">
                        <p>Error: {submissionsStatus.lastTestResult.error}</p>
                      </div>
                    )}
                    <p className="text-xs mt-2 font-medium">
                      {submissionsStatus.lastTestResult.success ? (
                        <>
                          ✅ <strong>Check your Google Sheet - you should see a new row with this test data!</strong>
                        </>
                      ) : (
                        <>
                          ❌ <strong>Please check sheet permissions and try again</strong>
                        </>
                      )}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <a
                href="https://docs.google.com/spreadsheets/d/1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                📊 Open Your Submissions Sheet →
              </a>
            </div>
          </CardContent>
        </Card>
      )}
      */}
    </div>
  )
}
