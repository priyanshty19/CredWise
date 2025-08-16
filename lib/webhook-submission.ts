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

export interface WebhookSubmissionData {
  timestamp?: string
  monthlyIncome: string
  spendingCategories: string[]
  monthlySpending: string
  currentCards: string
  creditScore: string
  preferredBanks: string[]
  joiningFeePreference: string
  userAgent?: string
  ipAddress?: string
}

// Webhook URL from Zapier, Make.com, or similar service
const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL

export async function submitViaWebhook(submission: UserSubmission | WebhookSubmissionData): Promise<{
  success: boolean
  error?: string
  submissionId?: string
}> {
  try {
    console.log("📝 Submitting via webhook...")
    console.log("📊 Submission data:", submission)

    let submissionData: any
    if ("creditScore" in submission && typeof submission.creditScore === "number") {
      submissionData = {
        timestamp: submission.timestamp,
        creditScore: submission.creditScore,
        monthlyIncome: submission.monthlyIncome,
        cardType: submission.cardType,
        preferredBrand: submission.preferredBrand || "Any",
        maxJoiningFee: submission.maxJoiningFee?.toString() || "Any",
        topN: submission.topN,
        submissionType: submission.submissionType,
        userAgent: submission.userAgent || "Unknown",
      }
    } else {
      submissionData = {
        ...submission,
        timestamp: submission.timestamp || new Date().toISOString(),
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Server",
      }
    }

    const webhookUrl = process.env.WEBHOOK_URL || process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!webhookUrl) {
      return {
        success: false,
        error: "Webhook URL not configured",
      }
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CredWise-App/1.0",
      },
      body: JSON.stringify(submissionData),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Webhook failed with status: ${response.status}`,
      }
    }

    const result = await response.json()

    return {
      success: true,
      submissionId: result.id || `sub_${Date.now()}`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Webhook submission failed",
    }
  }
}

export async function validateWebhookEndpoint(url: string): Promise<{
  valid: boolean
  error?: string
  responseTime?: number
}> {
  const startTime = Date.now()

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: true }),
    })

    const responseTime = Date.now() - startTime

    if (response.ok) {
      return {
        valid: true,
        responseTime,
      }
    } else {
      return {
        valid: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
      }
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Connection failed",
      responseTime: Date.now() - startTime,
    }
  }
}
