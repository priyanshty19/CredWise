"use server"

interface PortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "etf"
  invested: number
  current: number
  units: number
  nav: number
  date: string
}

export async function uploadPortfolioFiles(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    console.log(`📄 Processing file: ${file.name}`)

    // ⚠️ IMPORTANT: This is currently MOCK DATA ONLY
    // The system is NOT actually parsing your real files
    // It just generates fake data based on filename

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 🚨 HARDCODED MOCK DATA - NOT READING YOUR ACTUAL FILES
    const mockData: PortfolioEntry[] = []

    if (file.name.toLowerCase().includes("mutual")) {
      // These are FAKE mutual fund entries, not from your real file
      mockData.push(
        {
          id: `mf_${Date.now()}_1`,
          name: "SBI Blue Chip Fund - Direct Growth", // ← FAKE DATA
          type: "mutual_fund",
          invested: 50000, // ← FAKE AMOUNTS
          current: 58500,
          units: 1250.75,
          nav: 46.78,
          date: "2024-01-15",
        },
        {
          id: `mf_${Date.now()}_2`,
          name: "HDFC Top 100 Fund - Direct Growth", // ← FAKE DATA
          type: "mutual_fund",
          invested: 75000, // ← FAKE AMOUNTS
          current: 82300,
          units: 1456.89,
          nav: 56.52,
          date: "2024-02-10",
        },
        {
          id: `mf_${Date.now()}_3`,
          name: "Axis Small Cap Fund - Direct Growth", // ← FAKE DATA
          type: "mutual_fund",
          invested: 30000, // ← FAKE AMOUNTS
          current: 35600,
          units: 678.45,
          nav: 52.48,
          date: "2024-03-05",
        },
      )
    } else if (file.name.toLowerCase().includes("stock")) {
      // These are FAKE stock entries, not from your real file
      mockData.push(
        {
          id: `stock_${Date.now()}_1`,
          name: "Reliance Industries Ltd", // ← FAKE DATA
          type: "stock",
          invested: 100000, // ← FAKE AMOUNTS
          current: 115000,
          units: 50,
          nav: 2300,
          date: "2024-01-20",
        },
        {
          id: `stock_${Date.now()}_2`,
          name: "Tata Consultancy Services", // ← FAKE DATA
          type: "stock",
          invested: 80000, // ← FAKE AMOUNTS
          current: 92000,
          units: 25,
          nav: 3680,
          date: "2024-02-15",
        },
        {
          id: `stock_${Date.now()}_3`,
          name: "HDFC Bank Ltd", // ← FAKE DATA
          type: "stock",
          invested: 60000, // ← FAKE AMOUNTS
          current: 58500,
          units: 40,
          nav: 1462.5,
          date: "2024-03-01",
        },
      )
    } else {
      // Generic FAKE mixed portfolio
      mockData.push(
        {
          id: `generic_${Date.now()}_1`,
          name: "ICICI Prudential Bluechip Fund", // ← FAKE DATA
          type: "mutual_fund",
          invested: 45000, // ← FAKE AMOUNTS
          current: 52000,
          units: 890.25,
          nav: 58.42,
          date: "2024-01-10",
        },
        {
          id: `generic_${Date.now()}_2`,
          name: "Infosys Ltd", // ← FAKE DATA
          type: "stock",
          invested: 70000, // ← FAKE AMOUNTS
          current: 78000,
          units: 50,
          nav: 1560,
          date: "2024-02-05",
        },
        {
          id: `generic_${Date.now()}_3`,
          name: "Wipro Ltd", // ← FAKE DATA
          type: "stock",
          invested: 40000, // ← FAKE AMOUNTS
          current: 38500,
          units: 100,
          nav: 385,
          date: "2024-03-15",
        },
      )
    }

    console.log(
      `✅ Generated ${mockData.length} MOCK portfolio entries (NOT from your real file):`,
      mockData.map((d) => d.name),
    )

    return {
      success: true,
      data: mockData,
      message: `⚠️ DEMO MODE: Generated ${mockData.length} sample investments (not from your actual file)`,
    }
  } catch (error) {
    console.error("❌ Error processing file:", error)
    return {
      success: false,
      error: "Failed to process file. Please check the file format and try again.",
    }
  }
}
