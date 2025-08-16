export interface WebhookSubmissionData {
  monthlyIncome: number
  spendingCategories: string[]
  preferredBanks: string[]
  maxAnnualFee: number
  cardType: string
  recommendations: Array<{
    cardName: string
    bank: string
    matchScore: number
  }>
  timestamp: string
  userAgent?: string
}

export async function submitViaWebhook(data: WebhookSubmissionData): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // This would be your webhook endpoint
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL

    if (!webhookUrl) {
      throw new Error("Webhook URL not configured")
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Webhook submission error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Webhook failed",
    }
  }
}
