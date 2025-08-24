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

export interface PortfolioSummary {
  totalInvestments: number
  currentPortfolioValue: number
  profitLoss: number
  profitLossPercentage: number
  xirr: number
  personalDetails?: {
    name: string
    mobileNumber: string
    pan: string
  }
}

export interface GraphData {
  barGraph: Array<{ x: string; y: number }>
  lineGraph: {
    investedValue: Array<{ x: string; y: number }>
    currentValue: Array<{ x: string; y: number }>
  }
  pieChart: Array<{ category: string; units: number; percentage: number }>
  categoryBreakdown: Array<{
    category: string
    totalInvested: number
    currentValue: number
    returns: number
    count: number
    percentage: number
  }>
  amcBreakdown: Array<{
    amc: string
    totalInvested: number
    currentValue: number
    returns: number
    count: number
    percentage: number
  }>
}

export interface PortfolioParseResult {
  success: boolean
  data: ParsedPortfolioData[]
  summary: PortfolioSummary
  graphData: GraphData
  errors: string[]
  fileName: string
  processingTime: number
}

export class PortfolioParser {
  private static parseCSV(content: string): string[][] {
    const lines = content.split(/\r?\n/)
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
          row.push(current.trim().replace(/^"|"$/g, ""))
          current = ""
        } else {
          current += char
        }
      }

      row.push(current.trim().replace(/^"|"$/g, ""))
      result.push(row)
    }

    return result
  }

  private static findSummaryData(data: string[][]): PortfolioSummary {
    const summary: PortfolioSummary = {
      totalInvestments: 0,
      currentPortfolioValue: 0,
      profitLoss: 0,
      profitLossPercentage: 0,
      xirr: 0,
      personalDetails: {
        name: "",
        mobileNumber: "",
        pan: "",
      },
    }

    // Look for personal details
    for (let i = 0; i < Math.min(data.length, 20); i++) {
      const row = data[i]
      if (row[0]?.toLowerCase().includes("name") && row[1]) {
        summary.personalDetails!.name = row[1]
      }
      if (row[0]?.toLowerCase().includes("mobile") && row[1]) {
        summary.personalDetails!.mobileNumber = row[1]
      }
      if (row[0]?.toLowerCase().includes("pan") && row[1]) {
        summary.personalDetails!.pan = row[1]
      }
    }

    // Look for holding summary
    for (let i = 0; i < data.length; i++) {
      const row = data[i]

      // Check if this row contains summary data
      if (row[0]?.toLowerCase().includes("total investments") || row[0]?.toLowerCase().includes("total investment")) {
        summary.totalInvestments = this.parseNumericValue(row[1] || "0")

        // Look for other summary values in the same row or nearby rows
        if (row[2]) summary.currentPortfolioValue = this.parseNumericValue(row[2])
        if (row[3]) summary.profitLoss = this.parseNumericValue(row[3])
        if (row[4]) summary.profitLossPercentage = this.parseNumericValue(row[4])
        if (row[5]) summary.xirr = this.parseNumericValue(row[5])

        // Sometimes data might be in the next row
        if (i + 1 < data.length) {
          const nextRow = data[i + 1]
          if (!summary.currentPortfolioValue && nextRow[1]) {
            summary.currentPortfolioValue = this.parseNumericValue(nextRow[1])
          }
          if (!summary.profitLoss && nextRow[2]) {
            summary.profitLoss = this.parseNumericValue(nextRow[2])
          }
          if (!summary.profitLossPercentage && nextRow[3]) {
            summary.profitLossPercentage = this.parseNumericValue(nextRow[3])
          }
          if (!summary.xirr && nextRow[4]) {
            summary.xirr = this.parseNumericValue(nextRow[4])
          }
        }
        break
      }
    }

    return summary
  }

  private static findHeaderRow(data: string[][]): number {
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      // Look for the holdings table header
      if (
        row.some(
          (cell) => cell && (cell.toLowerCase().includes("scheme name") || cell.toLowerCase().includes("fund name")),
        )
      ) {
        return i
      }
    }
    return -1
  }

  private static mapColumns(headers: string[]): Record<string, number> {
    const columnMap: Record<string, number> = {}

    const mappings = {
      schemeName: ["scheme name", "fund name", "scheme", "fund"],
      amc: ["amc", "asset management company", "fund house", "company"],
      category: ["category", "fund category", "type", "asset class"],
      subCategory: ["sub-category", "sub category", "subcategory", "sub type"],
      folioNo: ["folio no.", "folio no", "folio number", "folio", "folio no"],
      source: ["source", "platform", "broker", "exchange"],
      units: ["units", "quantity", "shares", "qty"],
      investedValue: ["invested value", "invested amount", "cost", "purchase value", "amount invested"],
      currentValue: ["current value", "market value", "present value", "current amount"],
      returns: ["returns", "gain/loss", "p&l", "profit/loss", "absolute return"],
      xirr: ["xirr", "irr", "annualized return", "cagr", "return %"],
    }

    for (const [key, variations] of Object.entries(mappings)) {
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i]?.trim().toLowerCase() || ""
        if (variations.some((variation) => header.includes(variation))) {
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

    // Handle percentage values
    if (typeof value === "string" && value.includes("%")) {
      const cleaned = value.replace(/[%\s]/g, "")
      const parsed = Number.parseFloat(cleaned)
      return isNaN(parsed) ? 0 : parsed
    }

    // Remove currency symbols, commas, and other non-numeric characters
    const cleaned = value
      .toString()
      .replace(/[₹$,\s]/g, "")
      .replace(/[()]/g, "") // Remove parentheses
      .trim()

    const parsed = Number.parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  private static generateGraphData(data: ParsedPortfolioData[], summary: PortfolioSummary): GraphData {
    // Bar Graph: Current Value by Scheme Name (top 15)
    const barData = data
      .filter((item) => item.currentValue > 0)
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 15)
      .map((item) => ({
        x: item.schemeName.length > 25 ? item.schemeName.substring(0, 25) + "..." : item.schemeName,
        y: item.currentValue,
      }))

    // Line Graph: Invested vs Current Value (top 12)
    const lineData = data
      .filter((item) => item.investedValue > 0 || item.currentValue > 0)
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 12)

    const investedValueData = lineData.map((item) => ({
      x: item.schemeName.length > 20 ? item.schemeName.substring(0, 20) + "..." : item.schemeName,
      y: item.investedValue,
    }))

    const currentValueData = lineData.map((item) => ({
      x: item.schemeName.length > 20 ? item.schemeName.substring(0, 20) + "..." : item.schemeName,
      y: item.currentValue,
    }))

    // Pie Chart: Current Value Distribution by Category
    const categoryValues = data.reduce(
      (acc, item) => {
        if (item.category && item.currentValue > 0) {
          acc[item.category] = (acc[item.category] || 0) + item.currentValue
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const totalValue = Object.values(categoryValues).reduce((sum, val) => sum + val, 0)
    const pieData = Object.entries(categoryValues)
      .map(([category, value]) => ({
        category,
        units: value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.units - a.units)

    // Category Breakdown
    const categoryBreakdown = Object.entries(
      data.reduce(
        (acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = {
              totalInvested: 0,
              currentValue: 0,
              returns: 0,
              count: 0,
            }
          }
          acc[item.category].totalInvested += item.investedValue
          acc[item.category].currentValue += item.currentValue
          acc[item.category].returns += item.returns
          acc[item.category].count += 1
          return acc
        },
        {} as Record<string, any>,
      ),
    )
      .map(([category, data]) => ({
        category,
        ...data,
        percentage: summary.currentPortfolioValue > 0 ? (data.currentValue / summary.currentPortfolioValue) * 100 : 0,
      }))
      .sort((a, b) => b.currentValue - a.currentValue)

    // AMC Breakdown
    const amcBreakdown = Object.entries(
      data.reduce(
        (acc, item) => {
          if (!acc[item.amc]) {
            acc[item.amc] = {
              totalInvested: 0,
              currentValue: 0,
              returns: 0,
              count: 0,
            }
          }
          acc[item.amc].totalInvested += item.investedValue
          acc[item.amc].currentValue += item.currentValue
          acc[item.amc].returns += item.returns
          acc[item.amc].count += 1
          return acc
        },
        {} as Record<string, any>,
      ),
    )
      .map(([amc, data]) => ({
        amc,
        ...data,
        percentage: summary.currentPortfolioValue > 0 ? (data.currentValue / summary.currentPortfolioValue) * 100 : 0,
      }))
      .sort((a, b) => b.currentValue - a.currentValue)

    return {
      barGraph: barData,
      lineGraph: {
        investedValue: investedValueData,
        currentValue: currentValueData,
      },
      pieChart: pieData,
      categoryBreakdown,
      amcBreakdown,
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
        throw new Error("File size exceeds 10MB limit")
      }

      const fileName = file.name.toLowerCase()
      if (!fileName.endsWith(".csv")) {
        errors.push("Currently only CSV files are supported. Please convert Excel files to CSV format.")
        return {
          success: false,
          data: [],
          summary: {
            totalInvestments: 0,
            currentPortfolioValue: 0,
            profitLoss: 0,
            profitLossPercentage: 0,
            xirr: 0,
          },
          graphData: {
            barGraph: [],
            lineGraph: { investedValue: [], currentValue: [] },
            pieChart: [],
            categoryBreakdown: [],
            amcBreakdown: [],
          },
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

      // Extract summary data first
      const summary = this.findSummaryData(rawData)

      // Find header row for holdings table
      const headerRowIndex = this.findHeaderRow(rawData)
      if (headerRowIndex === -1) {
        throw new Error(
          'Could not find holdings table with "Scheme Name" column. Please ensure your file has the correct format.',
        )
      }

      const headers = rawData[headerRowIndex]
      const columnMap = this.mapColumns(headers)

      // Validate required columns
      if (!columnMap.schemeName) {
        throw new Error('Required column "Scheme Name" not found in holdings table')
      }

      // Parse data rows
      const parsedData: ParsedPortfolioData[] = []

      for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i]
        if (!row || row.length === 0 || !row[columnMap.schemeName]?.trim()) {
          continue
        }

        try {
          const investedValue = this.parseNumericValue(row[columnMap.investedValue] || "0")
          const currentValue = this.parseNumericValue(row[columnMap.currentValue] || "0")
          const returns = this.parseNumericValue(row[columnMap.returns] || "0") || currentValue - investedValue

          const item: ParsedPortfolioData = {
            schemeName: row[columnMap.schemeName]?.trim() || "",
            amc: row[columnMap.amc]?.trim() || "Unknown AMC",
            category: row[columnMap.category]?.trim() || "Unknown Category",
            subCategory: row[columnMap.subCategory]?.trim() || "Unknown Sub-category",
            folioNo: row[columnMap.folioNo]?.trim() || "N/A",
            source: row[columnMap.source]?.trim() || "Unknown Source",
            units: this.parseNumericValue(row[columnMap.units] || "0"),
            investedValue,
            currentValue,
            returns,
            xirr: this.parseNumericValue(row[columnMap.xirr] || "0"),
          }

          if (item.schemeName && (item.investedValue > 0 || item.currentValue > 0)) {
            parsedData.push(item)
          }
        } catch (rowError) {
          errors.push(`Error parsing row ${i + 1}: ${rowError}`)
        }
      }

      if (parsedData.length === 0) {
        throw new Error("No valid holdings data found in the file")
      }

      // If summary wasn't found in file, calculate from parsed data
      if (summary.totalInvestments === 0) {
        summary.totalInvestments = parsedData.reduce((sum, item) => sum + item.investedValue, 0)
        summary.currentPortfolioValue = parsedData.reduce((sum, item) => sum + item.currentValue, 0)
        summary.profitLoss = summary.currentPortfolioValue - summary.totalInvestments
        summary.profitLossPercentage =
          summary.totalInvestments > 0 ? (summary.profitLoss / summary.totalInvestments) * 100 : 0
      }

      // Generate graph data
      const graphData = this.generateGraphData(parsedData, summary)

      return {
        success: true,
        data: parsedData,
        summary,
        graphData,
        errors,
        fileName: file.name,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unknown error occurred")

      return {
        success: false,
        data: [],
        summary: {
          totalInvestments: 0,
          currentPortfolioValue: 0,
          profitLoss: 0,
          profitLossPercentage: 0,
          xirr: 0,
        },
        graphData: {
          barGraph: [],
          lineGraph: { investedValue: [], currentValue: [] },
          pieChart: [],
          categoryBreakdown: [],
          amcBreakdown: [],
        },
        errors,
        fileName: file.name,
        processingTime: Date.now() - startTime,
      }
    }
  }
}
