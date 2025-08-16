export interface SubmissionData {
  monthlyIncome: number
  spendingCategories: string[]
  preferredBanks: string[]
  maxAnnualFee: number
  cardType: string
  topRecommendation: string
  totalRecommendations: number
  userAgent?: string
}

export async function submitToGoogleSheets(data: SubmissionData): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      throw new Error("Apps Script URL not configured")
    }

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Submission failed")
    }

    return { success: true }
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
