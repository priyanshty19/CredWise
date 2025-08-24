export interface ParsedPortfolioData {
  schemeName: string
  amc: string
  category: string
  subCategory: string
  folioNo: string
  source: string
  units: number
  investedValue: number
  currentValue: number
  returns: number
  xirr: number
}

export interface GraphData {
  barGraph: Array<{ x: string; y: number }>
  lineGraph: {
    investedValue: Array<{ x: string; y: number }>
    currentValue: Array<{ x: string; y: number }>
  }
  pieChart: Array<{ category: string; units: number }>
}

export interface PortfolioParseResult {
  success: boolean
  data: ParsedPortfolioData[]
  graphData: GraphData
  summary: {
    totalInvested: number
    totalCurrent: number
    totalReturns: number
    totalSchemes: number
  }
  errors: string[]
  fileName: string
  processingTime: number
}

const REQUIRED_COLUMNS = [
  "Scheme Name",
  "AMC",
  "Category",
  "Sub-category",
  "Folio No.",
  "Source",
  "Units",
  "Invested Value",
  "Current Value",
  "Returns",
  "XIRR",
]

export class PortfolioParser {
  private static parseCSV(content: string): string[][] {
    const lines = content.split("\n")
    const result: string[][] = []

    for (const line of lines) {
      if (line.trim() === "") continue

      const row: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          row.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }

      row.push(current.trim())
      result.push(row)
    }

    return result
  }

  private static findHeaderRow(data: string[][]): number {
    for (let i = 0; i < Math.min(data.length, 10); i++) {
      const row = data[i]
      if (row.some((cell) => cell && cell.includes("Scheme Name"))) {
        return i
      }
    }
    return -1
  }

  private static mapColumns(headers: string[]): Record<string, number> {
    const columnMap: Record<string, number> = {}

    const mappings = {
      schemeName: ["Scheme Name", "Scheme", "Fund Name", "Fund"],
      amc: ["AMC", "Asset Management Company", "Fund House"],
      category: ["Category", "Fund Category", "Type"],
      subCategory: ["Sub-category", "Sub Category", "Subcategory"],
      folioNo: ["Folio No.", "Folio No", "Folio Number", "Folio"],
      source: ["Source", "Platform", "Broker"],
      units: ["Units", "Quantity", "Shares"],
      investedValue: ["Invested Value", "Invested Amount", "Cost", "Purchase Value"],
      currentValue: ["Current Value", "Market Value", "Present Value"],
      returns: ["Returns", "Gain/Loss", "P&L", "Profit/Loss"],
      xirr: ["XIRR", "IRR", "Annualized Return"],
    }

    for (const [key, variations] of Object.entries(mappings)) {
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i]?.trim() || ""
        if (variations.some((variation) => header.toLowerCase().includes(variation.toLowerCase()))) {
          columnMap[key] = i
          break
        }
      }
    }

    return columnMap
  }

  private static parseNumericValue(value: string | number): number {
    if (typeof value === "number") return value
    if (!value || value === "") return 0

    // Remove currency symbols, commas, and other non-numeric characters
    const cleaned = value
      .toString()
      .replace(/[₹$,\s]/g, "")
      .replace(/[()]/g, "") // Remove parentheses
      .trim()

    const parsed = Number.parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  private static generateGraphData(data: ParsedPortfolioData[]): GraphData {
    // Bar Graph: Current Value by Scheme Name (top 20)
    const barData = data
      .filter((item) => item.currentValue > 0)
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 20)
      .map((item) => ({
        x: item.schemeName.length > 30 ? item.schemeName.substring(0, 30) + "..." : item.schemeName,
        y: item.currentValue,
      }))

    // Line Graph: Invested vs Current Value
    const lineData = data
      .filter((item) => item.investedValue > 0 || item.currentValue > 0)
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 15)

    const investedValueData = lineData.map((item) => ({
      x: item.schemeName.length > 25 ? item.schemeName.substring(0, 25) + "..." : item.schemeName,
      y: item.investedValue,
    }))

    const currentValueData = lineData.map((item) => ({
      x: item.schemeName.length > 25 ? item.schemeName.substring(0, 25) + "..." : item.schemeName,
      y: item.currentValue,
    }))

    // Pie Chart: Units Distribution by Category
    const categoryUnits = data.reduce(
      (acc, item) => {
        if (item.category && item.units > 0) {
          acc[item.category] = (acc[item.category] || 0) + item.units
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const pieData = Object.entries(categoryUnits)
      .map(([category, units]) => ({ category, units }))
      .sort((a, b) => b.units - a.units)

    return {
      barGraph: barData,
      lineGraph: {
        investedValue: investedValueData,
        currentValue: currentValueData,
      },
      pieChart: pieData,
    }
  }

  static async parseFile(file: File): Promise<PortfolioParseResult> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      // Validate file
      if (!file) {
        throw new Error("No file provided")
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error("File size exceeds 10MB limit")
      }

      const fileName = file.name.toLowerCase()
      if (!fileName.endsWith(".csv")) {
        errors.push("Currently only CSV files are supported. Please convert Excel files to CSV format.")
        return {
          success: false,
          data: [],
          graphData: { barGraph: [], lineGraph: { investedValue: [], currentValue: [] }, pieChart: [] },
          summary: { totalInvested: 0, totalCurrent: 0, totalReturns: 0, totalSchemes: 0 },
          errors,
          fileName: file.name,
          processingTime: Date.now() - startTime,
        }
      }

      // Read file content
      const content = await file.text()
      const rawData = this.parseCSV(content)

      if (rawData.length === 0) {
        throw new Error("File appears to be empty")
      }

      // Find header row
      const headerRowIndex = this.findHeaderRow(rawData)
      if (headerRowIndex === -1) {
        throw new Error(
          'Could not find header row containing "Scheme Name". Please ensure your file has the correct format.',
        )
      }

      const headers = rawData[headerRowIndex]
      const columnMap = this.mapColumns(headers)

      // Validate required columns
      if (!columnMap.schemeName) {
        throw new Error('Required column "Scheme Name" not found')
      }

      // Parse data rows
      const parsedData: ParsedPortfolioData[] = []

      for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i]
        if (!row || row.length === 0 || !row[columnMap.schemeName]?.trim()) {
          continue
        }

        try {
          const item: ParsedPortfolioData = {
            schemeName: row[columnMap.schemeName]?.trim() || "",
            amc: row[columnMap.amc]?.trim() || "",
            category: row[columnMap.category]?.trim() || "",
            subCategory: row[columnMap.subCategory]?.trim() || "",
            folioNo: row[columnMap.folioNo]?.trim() || "",
            source: row[columnMap.source]?.trim() || "",
            units: this.parseNumericValue(row[columnMap.units] || "0"),
            investedValue: this.parseNumericValue(row[columnMap.investedValue] || "0"),
            currentValue: this.parseNumericValue(row[columnMap.currentValue] || "0"),
            returns: this.parseNumericValue(row[columnMap.returns] || "0"),
            xirr: this.parseNumericValue(row[columnMap.xirr] || "0"),
          }

          // Calculate returns if not provided
          if (item.returns === 0 && item.investedValue > 0 && item.currentValue > 0) {
            item.returns = item.currentValue - item.investedValue
          }

          if (item.schemeName) {
            parsedData.push(item)
          }
        } catch (rowError) {
          errors.push(`Error parsing row ${i + 1}: ${rowError}`)
        }
      }

      if (parsedData.length === 0) {
        throw new Error("No valid data rows found in the file")
      }

      // Generate summary
      const summary = {
        totalInvested: parsedData.reduce((sum, item) => sum + item.investedValue, 0),
        totalCurrent: parsedData.reduce((sum, item) => sum + item.currentValue, 0),
        totalReturns: parsedData.reduce((sum, item) => sum + item.returns, 0),
        totalSchemes: parsedData.length,
      }

      // Generate graph data
      const graphData = this.generateGraphData(parsedData)

      return {
        success: true,
        data: parsedData,
        graphData,
        summary,
        errors,
        fileName: file.name,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unknown error occurred")

      return {
        success: false,
        data: [],
        graphData: { barGraph: [], lineGraph: { investedValue: [], currentValue: [] }, pieChart: [] },
        summary: { totalInvested: 0, totalCurrent: 0, totalReturns: 0, totalSchemes: 0 },
        errors,
        fileName: file.name,
        processingTime: Date.now() - startTime,
      }
    }
  }
}
