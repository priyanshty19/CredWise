"use server"

interface ColabResponse {
  success: boolean
  data?: {
    summary: {
      total_investments: number
      total_current_value: number
      total_gain_loss: number
      gain_loss_percentage: number
      top_performers: Array<{
        name: string
        gain_loss_percentage: number
      }>
      worst_performers: Array<{
        name: string
        gain_loss_percentage: number
      }>
    }
    holdings: Array<{
      name: string
      quantity: number
      avg_price: number
      current_price: number
      invested_amount: number
      current_value: number
      gain_loss: number
      gain_loss_percentage: number
      allocation_percentage: number
    }>
    sector_allocation: Record<string, number>
    monthly_performance: Array<{
      month: string
      value: number
    }>
  }
  error?: string
  processing_time?: number
}

export async function processFinancialDocument(formData: FormData): Promise<ColabResponse> {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
      "application/pdf", // .pdf
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Unsupported file type. Please upload Excel, CSV, or PDF files.",
      }
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "File size too large. Please upload files smaller than 10MB.",
      }
    }

    // Convert file to base64 for transmission
    const arrayBuffer = await file.arrayBuffer()
    const base64File = Buffer.from(arrayBuffer).toString("base64")

    // Prepare payload for Colab
    const payload = {
      file_name: file.name,
      file_type: file.type,
      file_content: base64File,
      processing_options: {
        generate_charts: true,
        include_sector_analysis: true,
        calculate_performance_metrics: true,
      },
    }

    // Send to Google Colab endpoint
    const colabEndpoint = process.env.COLAB_ENDPOINT_URL || "https://your-colab-endpoint.ngrok.io/process"

    const response = await fetch(colabEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.COLAB_API_KEY || ""}`,
      },
      body: JSON.stringify(payload),
      // Increase timeout for processing
      signal: AbortSignal.timeout(60000), // 60 seconds
    })

    if (!response.ok) {
      throw new Error(`Colab processing failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to process document",
      }
    }

    return {
      success: true,
      data: result.data,
      processing_time: result.processing_time,
    }
  } catch (error) {
    console.error("Colab integration error:", error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { success: false, error: "Processing timeout. Please try with a smaller file." }
      }
      return { success: false, error: error.message }
    }

    return { success: false, error: "An unexpected error occurred during processing" }
  }
}

export async function getColabStatus(): Promise<{ status: string; message: string }> {
  try {
    const colabEndpoint = process.env.COLAB_ENDPOINT_URL || "https://your-colab-endpoint.ngrok.io/status"

    const response = await fetch(colabEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.COLAB_API_KEY || ""}`,
      },
      signal: AbortSignal.timeout(10000), // 10 seconds
    })

    if (!response.ok) {
      return { status: "error", message: "Colab service unavailable" }
    }

    const result = await response.json()
    return { status: "online", message: "Colab service is running" }
  } catch (error) {
    return { status: "offline", message: "Cannot connect to Colab service" }
  }
}
