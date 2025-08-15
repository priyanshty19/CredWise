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

// Webhook URL from Zapier, Make.com, or similar service
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL

export async function submitViaWebhook(submission: UserSubmission): Promise<boolean> {
  try {
    console.log("📝 Submitting via webhook...")
    console.log("📊 Submission data:", submission)

    if (!WEBHOOK_URL) {
      throw new Error("Webhook URL not configured. Please add NEXT_PUBLIC_WEBHOOK_URL to your environment variables.")
    }

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Format data for the webhook service
        timestamp: submission.timestamp,
        creditScore: submission.creditScore,
        monthlyIncome: submission.monthlyIncome,
        cardType: submission.cardType,
        preferredBrand: submission.preferredBrand || "Any",
        maxJoiningFee: submission.maxJoiningFee?.toString() || "Any",
        topN: submission.topN,
        submissionType: submission.submissionType,
        userAgent: submission.userAgent || "Unknown",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Webhook submission failed: ${response.status} - ${errorText}`)
    }

    console.log("✅ Webhook submission successful")
    return true
  } catch (error) {
    console.error("❌ Webhook submission failed:", error)
    throw error
  }
}
