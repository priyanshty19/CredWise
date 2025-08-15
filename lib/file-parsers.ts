export interface ParsedInvestment {
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  broker: string
  type: "equity" | "mutual_fund" | "bond" | "other"
}

export interface ParseResult {
  success: boolean
  data: ParsedInvestment[]
  broker: string
  totalInvestments: number
  totalValue: number
  totalGainLoss: number
  error?: string
}

// Zerodha Console CSV Parser
function parseZerodhaCSV(csvText: string): ParseResult {
  const lines = csvText.split("\n").filter((line) => line.trim())
  const headers = lines[0].toLowerCase()

  // Check if it's Zerodha format
  if (!headers.includes("instrument") || !headers.includes("qty") || !headers.includes("avg")) {
    throw new Error("Not a valid Zerodha CSV format")
  }

  const investments: ParsedInvestment[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

    if (values.length < 6) continue

    const name = values[0] || "Unknown"
    const quantity = Number.parseFloat(values[1]) || 0
    const avgPrice = Number.parseFloat(values[2]) || 0
    const currentPrice = Number.parseFloat(values[3]) || avgPrice
    const currentValue = quantity * currentPrice
    const investedValue = quantity * avgPrice
    const gainLoss = currentValue - investedValue
    const gainLossPercentage = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0

    investments.push({
      name,
      quantity,
      avgPrice,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercentage,
      broker: "Zerodha",
      type: name.toLowerCase().includes("mutual") ? "mutual_fund" : "equity",
    })
  }

  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalGainLoss = investments.reduce((sum, inv) => sum + inv.gainLoss, 0)

  return {
    success: true,
    data: investments,
    broker: "Zerodha",
    totalInvestments: investments.length,
    totalValue,
    totalGainLoss,
  }
}

// Groww CSV Parser
function parseGrowwCSV(csvText: string): ParseResult {
  const lines = csvText.split("\n").filter((line) => line.trim())
  const headers = lines[0].toLowerCase()

  if (!headers.includes("scheme") || !headers.includes("units") || !headers.includes("nav")) {
    throw new Error("Not a valid Groww CSV format")
  }

  const investments: ParsedInvestment[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

    if (values.length < 5) continue

    const name = values[0] || "Unknown"
    const quantity = Number.parseFloat(values[1]) || 0
    const avgPrice = Number.parseFloat(values[2]) || 0
    const currentPrice = Number.parseFloat(values[3]) || avgPrice
    const currentValue = Number.parseFloat(values[4]) || quantity * currentPrice
    const investedValue = quantity * avgPrice
    const gainLoss = currentValue - investedValue
    const gainLossPercentage = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0

    investments.push({
      name,
      quantity,
      avgPrice,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercentage,
      broker: "Groww",
      type: "mutual_fund",
    })
  }

  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalGainLoss = investments.reduce((sum, inv) => sum + inv.gainLoss, 0)

  return {
    success: true,
    data: investments,
    broker: "Groww",
    totalInvestments: investments.length,
    totalValue,
    totalGainLoss,
  }
}

// Generic CSV Parser (fallback)
function parseGenericCSV(csvText: string): ParseResult {
  const lines = csvText.split("\n").filter((line) => line.trim())
  const headers = lines[0]
    .toLowerCase()
    .split(",")
    .map((h) => h.trim())

  const investments: ParsedInvestment[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

    if (values.length < 3) continue

    // Try to map common column names
    const nameIndex = headers.findIndex((h) => h.includes("name") || h.includes("instrument") || h.includes("scheme"))
    const qtyIndex = headers.findIndex((h) => h.includes("qty") || h.includes("units") || h.includes("quantity"))
    const priceIndex = headers.findIndex((h) => h.includes("price") || h.includes("nav") || h.includes("avg"))
    const valueIndex = headers.findIndex((h) => h.includes("value") || h.includes("amount"))

    const name = values[nameIndex] || values[0] || "Unknown"
    const quantity = Number.parseFloat(values[qtyIndex] || values[1]) || 1
    const avgPrice = Number.parseFloat(values[priceIndex] || values[2]) || 0
    const currentValue = Number.parseFloat(values[valueIndex] || values[3]) || quantity * avgPrice
    const currentPrice = currentValue / quantity
    const investedValue = quantity * avgPrice
    const gainLoss = currentValue - investedValue
    const gainLossPercentage = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0

    investments.push({
      name,
      quantity,
      avgPrice,
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercentage,
      broker: "Generic",
      type: "other",
    })
  }

  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalGainLoss = investments.reduce((sum, inv) => sum + inv.gainLoss, 0)

  return {
    success: true,
    data: investments,
    broker: "Generic",
    totalInvestments: investments.length,
    totalValue,
    totalGainLoss,
  }
}

export async function parseInvestmentFile(file: File): Promise<ParseResult> {
  try {
    const text = await file.text()

    // Try different parsers based on content
    const parsers = [parseZerodhaCSV, parseGrowwCSV, parseGenericCSV]

    for (const parser of parsers) {
      try {
        return parser(text)
      } catch (error) {
        // Continue to next parser
        continue
      }
    }

    throw new Error("Unable to parse file format")
  } catch (error) {
    return {
      success: false,
      data: [],
      broker: "Unknown",
      totalInvestments: 0,
      totalValue: 0,
      totalGainLoss: 0,
      error: error instanceof Error ? error.message : "Unknown parsing error",
    }
  }
}
