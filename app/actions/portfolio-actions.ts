"use server"

interface PortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "other"
  amount: number
  units?: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  fileName?: string
}

export async function uploadPortfolioFiles(formData: FormData) {
  try {
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return { success: false, error: "No files provided" }
    }

    console.log(`📄 Processing ${files.length} files...`)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const portfolioData: PortfolioEntry[] = []

    for (const file of files) {
      console.log(`📊 Processing file: ${file.name}`)

      // Generate mock data based on file name
      const isMutualFund = file.name.toLowerCase().includes("mutual")
      const isStock = file.name.toLowerCase().includes("stock") || file.name.toLowerCase().includes("equity")

      // Generate 3-8 random entries per file
      const entryCount = Math.floor(Math.random() * 6) + 3

      for (let i = 0; i < entryCount; i++) {
        const baseAmount = Math.floor(Math.random() * 100000) + 10000 // 10k to 110k
        const gainLossPercent = (Math.random() - 0.4) * 30 // -12% to +18% bias toward positive
        const currentValue = baseAmount * (1 + gainLossPercent / 100)

        let investmentName: string
        let type: "mutual_fund" | "stock" | "bond" | "other"

        if (isMutualFund) {
          const fundNames = [
            "HDFC Top 100 Fund",
            "SBI Bluechip Fund",
            "ICICI Prudential Value Discovery Fund",
            "Axis Long Term Equity Fund",
            "Mirae Asset Large Cap Fund",
            "Kotak Standard Multicap Fund",
            "DSP Tax Saver Fund",
            "Franklin India Prima Fund",
          ]
          investmentName = fundNames[Math.floor(Math.random() * fundNames.length)]
          type = "mutual_fund"
        } else if (isStock) {
          const stockNames = [
            "Reliance Industries Ltd",
            "Tata Consultancy Services",
            "HDFC Bank Ltd",
            "Infosys Ltd",
            "ICICI Bank Ltd",
            "State Bank of India",
            "Bharti Airtel Ltd",
            "ITC Ltd",
            "Hindustan Unilever Ltd",
            "Bajaj Finance Ltd",
          ]
          investmentName = stockNames[Math.floor(Math.random() * stockNames.length)]
          type = "stock"
        } else {
          // Mixed portfolio
          const allInvestments = [
            { name: "HDFC Top 100 Fund", type: "mutual_fund" as const },
            { name: "SBI Bluechip Fund", type: "mutual_fund" as const },
            { name: "Reliance Industries Ltd", type: "stock" as const },
            { name: "TCS Ltd", type: "stock" as const },
            { name: "Government Bond 2030", type: "bond" as const },
            { name: "Corporate Bond AAA", type: "bond" as const },
          ]
          const selected = allInvestments[Math.floor(Math.random() * allInvestments.length)]
          investmentName = selected.name
          type = selected.type
        }

        const entry: PortfolioEntry = {
          id: `${file.name}-${i}-${Date.now()}`,
          name: investmentName,
          type,
          amount: baseAmount,
          units: type === "mutual_fund" ? Math.floor(baseAmount / (Math.random() * 50 + 20)) : undefined,
          currentValue: Math.round(currentValue),
          gainLoss: Math.round(currentValue - baseAmount),
          gainLossPercentage: gainLossPercent,
          fileName: file.name,
        }

        portfolioData.push(entry)
      }
    }

    console.log(`✅ Generated ${portfolioData.length} portfolio entries from ${files.length} files`)

    return {
      success: true,
      portfolioData,
      message: `Successfully processed ${files.length} files and found ${portfolioData.length} investments`,
    }
  } catch (error) {
    console.error("❌ Error processing portfolio files:", error)
    return {
      success: false,
      error: "Failed to process files. Please try again.",
    }
  }
}
