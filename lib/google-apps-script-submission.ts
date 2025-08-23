export interface FormSubmissionData {
  monthlyIncome: string
  spendingCategories: string[]
  monthlySpending: string
  currentCards: string
  creditScore: string
  preferredBanks: string[]
  joiningFeePreference: string
}

export async function submitFormToGoogleSheets(data: FormSubmissionData): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      return {
        success: false,
        error: "Apps Script URL not configured",
      }
    }

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      }
    }

    const result = await response.json()

    if (result.success) {
      return { success: true }
    } else {
      return {
        success: false,
        error: result.error || "Unknown error occurred",
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    }
  }
}

export async function testGoogleAppsScriptConnection(): Promise<{
  success: boolean
  error?: string
  responseTime?: number
}> {
  const startTime = Date.now()

  try {
    const testData: FormSubmissionData = {
      monthlyIncome: "50000",
      spendingCategories: ["dining", "travel"],
      monthlySpending: "20000",
      currentCards: "1",
      creditScore: "750",
      preferredBanks: ["HDFC Bank"],
      joiningFeePreference: "low_fee",
    }

    const result = await submitFormToGoogleSheets(testData)
    const responseTime = Date.now() - startTime

    return {
      ...result,
      responseTime,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Test failed",
      responseTime: Date.now() - startTime,
    }
  }
}
