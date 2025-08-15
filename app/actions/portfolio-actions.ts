"use server"

interface PortfolioEntry {
  id: string
  type: "stock" | "mutual_fund" | "bond" | "etf" | "crypto" | "other"
  name: string
  symbol?: string
  quantity: number
  currentPrice: number
  purchasePrice: number
  purchaseDate: string
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
}

export async function uploadPortfolioFiles(formData: FormData): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    console.log("📄 Processing file:", file.name, "Size:", file.size, "Type:", file.type)

    // Simulate file processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock portfolio data based on file name/type
    let mockPortfolioEntries: PortfolioEntry[] = []

    if (file.name.toLowerCase().includes("mutual")) {
      // Mock mutual fund data
      mockPortfolioEntries = [
        {
          id: `mf_${Date.now()}_1`,
          type: "mutual_fund",
          name: "HDFC Top 100 Fund",
          symbol: "HDFC_TOP100",
          quantity: 1250.5,
          currentPrice: 850.75,
          purchasePrice: 720.5,
          purchaseDate: "2023-06-15",
          currentValue: 1063551.88,
          gainLoss: 162826.25,
          gainLossPercentage: 18.08,
        },
        {
          id: `mf_${Date.now()}_2`,
          type: "mutual_fund",
          name: "SBI Small Cap Fund",
          symbol: "SBI_SMALLCAP",
          quantity: 850.25,
          currentPrice: 125.3,
          purchasePrice: 98.75,
          purchaseDate: "2023-08-20",
          currentValue: 106576.33,
          gainLoss: 22951.64,
          gainLossPercentage: 26.87,
        },
      ]
    } else if (file.name.toLowerCase().includes("stock")) {
      // Mock stock data
      mockPortfolioEntries = [
        {
          id: `stock_${Date.now()}_1`,
          type: "stock",
          name: "Reliance Industries",
          symbol: "RELIANCE",
          quantity: 50,
          currentPrice: 2485.6,
          purchasePrice: 2150.3,
          purchaseDate: "2023-05-10",
          currentValue: 124280.0,
          gainLoss: 16765.0,
          gainLossPercentage: 15.59,
        },
        {
          id: `stock_${Date.now()}_2`,
          type: "stock",
          name: "Infosys Limited",
          symbol: "INFY",
          quantity: 75,
          currentPrice: 1456.8,
          purchasePrice: 1320.45,
          purchaseDate: "2023-07-22",
          currentValue: 109260.0,
          gainLoss: 10226.25,
          gainLossPercentage: 10.33,
        },
        {
          id: `stock_${Date.now()}_3`,
          type: "stock",
          name: "HDFC Bank",
          symbol: "HDFCBANK",
          quantity: 25,
          currentPrice: 1678.9,
          purchasePrice: 1520.75,
          purchaseDate: "2023-09-05",
          currentValue: 41972.5,
          gainLoss: 3953.75,
          gainLossPercentage: 10.4,
        },
      ]
    } else {
      // Generic portfolio data
      mockPortfolioEntries = [
        {
          id: `generic_${Date.now()}_1`,
          type: "stock",
          name: "Tata Consultancy Services",
          symbol: "TCS",
          quantity: 30,
          currentPrice: 3456.75,
          purchasePrice: 3120.5,
          purchaseDate: "2023-04-15",
          currentValue: 103702.5,
          gainLoss: 10087.5,
          gainLossPercentage: 10.78,
        },
      ]
    }

    const mockData = {
      fileName: file.name,
      fileType: file.type,
      portfolioEntries: mockPortfolioEntries,
      summary: {
        totalInvestments: mockPortfolioEntries.reduce((sum, entry) => sum + entry.currentValue, 0),
        totalGainLoss: mockPortfolioEntries.reduce((sum, entry) => sum + entry.gainLoss, 0),
        entriesCount: mockPortfolioEntries.length,
      },
      processedAt: new Date().toISOString(),
    }

    console.log("✅ File processed successfully:", {
      fileName: file.name,
      entriesFound: mockPortfolioEntries.length,
      totalValue: mockData.summary.totalInvestments,
    })

    return {
      success: true,
      data: mockData,
    }
  } catch (error) {
    console.error("❌ Error processing file:", error)
    return {
      success: false,
      error: "Failed to process file. Please check the file format and try again.",
    }
  }
}

export async function addManualEntry(entry: PortfolioEntry): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Simulate saving to database
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log("📝 Manual entry added:", {
      name: entry.name,
      type: entry.type,
      value: entry.currentValue,
      gainLoss: entry.gainLoss,
    })

    return { success: true }
  } catch (error) {
    console.error("❌ Error adding manual entry:", error)
    return {
      success: false,
      error: "Failed to add manual entry",
    }
  }
}
