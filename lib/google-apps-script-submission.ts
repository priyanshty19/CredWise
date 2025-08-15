interface UserSubmission {
  creditScore: number
  monthlyIncome: number
  cardType: string
  preferredBrand?: string
  maxJoiningFee?: number
  topN: number
  timestamp: string
  userAgent?: string
  submissionType: "basic" | "enhanced"
}

// Google Apps Script URL - you'll create this
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

export async function submitViaAppsScript(submission: UserSubmission): Promise<boolean> {
  try {
    console.log("📝 Submitting via Google Apps Script...")
    console.log("📊 Submission data:", submission)

    if (!APPS_SCRIPT_URL) {
      throw new Error(
        "Google Apps Script URL not configured. Please add NEXT_PUBLIC_APPS_SCRIPT_URL to your environment variables.",
      )
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Apps Script submission failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ Apps Script submission successful:", result)

    return result.success || false
  } catch (error) {
    console.error("❌ Apps Script submission failed:", error)
    throw error
  }
}
