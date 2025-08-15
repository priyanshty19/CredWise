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

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock portfolio data based on file name
    const mockData: PortfolioEntry[] = []

    if (file.name.toLowerCase().includes("mutual")) {
      // Mock mutual fund data
      mockData.push(
        {
          id: `mf_${Date.now()}_1`,
          name: "SBI Blue Chip Fund - Direct Growth",
          type: "mutual_fund",
          invested: 50000,
          current: 58500,
          units: 1250.75,
          nav: 46.78,
          date: "2024-01-15",
        },
        {
          id: `mf_${Date.now()}_2`,
          name: "HDFC Top 100 Fund - Direct Growth",
          type: "mutual_fund",
          invested: 75000,
          current: 82300,
          units: 1456.89,
          nav: 56.52,
          date: "2024-02-10",
        },
        {
          id: `mf_${Date.now()}_3`,
          name: "Axis Small Cap Fund - Direct Growth",
          type: "mutual_fund",
          invested: 30000,
          current: 35600,
          units: 678.45,
          nav: 52.48,
          date: "2024-03-05",
        },
      )
    } else if (file.name.toLowerCase().includes("stock")) {
      // Mock stock data
      mockData.push(
        {
          id: `stock_${Date.now()}_1`,
          name: "Reliance Industries Ltd",
          type: "stock",
          invested: 100000,
          current: 115000,
          units: 50,
          nav: 2300,
          date: "2024-01-20",
        },
        {
          id: `stock_${Date.now()}_2`,
          name: "Tata Consultancy Services",
          type: "stock",
          invested: 80000,
          current: 92000,
          units: 25,
          nav: 3680,
          date: "2024-02-15",
        },
        {
          id: `stock_${Date.now()}_3`,
          name: "HDFC Bank Ltd",
          type: "stock",
          invested: 60000,
          current: 58500,
          units: 40,
          nav: 1462.5,
          date: "2024-03-01",
        },
      )
    } else {
      // Generic mixed portfolio
      mockData.push(
        {
          id: `generic_${Date.now()}_1`,
          name: "ICICI Prudential Bluechip Fund",
          type: "mutual_fund",
          invested: 45000,
          current: 52000,
          units: 890.25,
          nav: 58.42,
          date: "2024-01-10",
        },
        {
          id: `generic_${Date.now()}_2`,
          name: "Infosys Ltd",
          type: "stock",
          invested: 70000,
          current: 78000,
          units: 50,
          nav: 1560,
          date: "2024-02-05",
        },
        {
          id: `generic_${Date.now()}_3`,
          name: "Wipro Ltd",
          type: "stock",
          invested: 40000,
          current: 38500,
          units: 100,
          nav: 385,
          date: "2024-03-15",
        },
      )
    }

    console.log(
      `✅ Generated ${mockData.length} portfolio entries:`,
      mockData.map((d) => d.name),
    )

    return {
      success: true,
      data: mockData,
      message: `Successfully processed ${file.name} and found ${mockData.length} investments`,
    }
  } catch (error) {
    console.error("❌ Error processing file:", error)
    return {
      success: false,
      error: "Failed to process file. Please check the file format and try again.",
    }
  }
}
