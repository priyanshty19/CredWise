interface ParsedPortfolioData {
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

interface PortfolioParseResult {
  success: boolean
  data: ParsedPortfolioData[]
  summary: {
    totalInvested: number
    totalCurrent: number
    totalReturns: number
    averageXIRR: number
    schemeCount: number
  }
  categoryBreakdown: Record<
    string,
    {
      invested: number
      current: number
      returns: number
      count: number
    }
  >
  amcBreakdown: Record<
    string,
    {
      invested: number
      current: number
      returns: number
      count: number
    }
  >
  errors: string[]
  fileName: string
  processingTime: number
}

interface ManualPortfolioEntry {
  id: string
  schemeName: string
  amc: string
  category: string
  investedValue: number
  currentValue: number
  date: string
}

class PortfolioParser {
  private requiredColumns = [
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

  private columnMappings: Record<string, string[]> = {
    schemeName: ["Scheme Name", "Scheme", "Fund Name", "Investment Name", "Security Name"],
    amc: ["AMC", "Asset Management Company", "Fund House", "Company", "Manager"],
    category: ["Category", "Asset Class", "Type", "Investment Type"],
    subCategory: ["Sub-category", "Sub Category", "Subcategory", "Sub-Category", "Sub Type"],
    folioNo: ["Folio No.", "Folio Number", "Folio", "Account No", "Account Number"],
    source: ["Source", "Platform", "Broker", "Exchange"],
    units: ["Units", "Quantity", "Shares", "Qty"],
    investedValue: ["Invested Value", "Investment Amount", "Cost", "Purchase Value", "Amount Invested"],
    currentValue: ["Current Value", "Market Value", "Present Value", "Current Amount"],
    returns: ["Returns", "Gain/Loss", "P&L", "Profit/Loss", "Absolute Return"],
    xirr: ["XIRR", "IRR", "Return %", "Annualized Return", "CAGR"],
  }

  async parseFile(file: File): Promise<PortfolioParseResult> {
    const startTime = Date.now()

    try {
      const fileContent = await this.readFile(file)
      const rows = this.parseFileContent(fileContent, file.name)

      if (rows.length === 0) {
        throw new Error("No data rows found in the file")
      }

      const headerRowIndex = this.findHeaderRow(rows)
      if (headerRowIndex === -1) {
        throw new Error("Could not find header row containing 'Scheme Name' or similar column")
      }

      const headers = rows[headerRowIndex]
      const dataRows = rows.slice(headerRowIndex + 1)

      const columnMapping = this.mapColumns(headers)
      const parsedData = this.parseDataRows(dataRows, columnMapping, headers)

      const summary = this.calculateSummary(parsedData)
      const categoryBreakdown = this.calculateCategoryBreakdown(parsedData)
      const amcBreakdown = this.calculateAMCBreakdown(parsedData)

      const processingTime = Date.now() - startTime

      return {
        success: true,
        data: parsedData,
        summary,
        categoryBreakdown,
        amcBreakdown,
        errors: [],
        fileName: file.name,
        processingTime,
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      return {
        success: false,
        data: [],
        summary: {
          totalInvested: 0,
          totalCurrent: 0,
          totalReturns: 0,
          averageXIRR: 0,
          schemeCount: 0,
        },
        categoryBreakdown: {},
        amcBreakdown: {},
        errors: [error instanceof Error ? error.message : "Unknown parsing error"],
        fileName: file.name,
        processingTime,
      }
    }
  }

  private async readFile(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      // For Excel files, read as ArrayBuffer
      if (file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls")) {
        reader.onload = (e) => resolve(e.target?.result as ArrayBuffer)
        reader.onerror = () => reject(new Error("Failed to read Excel file"))
        reader.readAsArrayBuffer(file)
      } else {
        // For CSV files, read as text
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read CSV file"))
        reader.readAsText(file)
      }
    })
  }

  private parseFileContent(content: string | ArrayBuffer, fileName: string): string[][] {
    const isCSV = fileName.toLowerCase().endsWith(".csv")
    const isExcel = fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls")

    if (isCSV) {
      return this.parseCSV(content as string)
    } else if (isExcel) {
      return this.parseExcel(content as ArrayBuffer)
    } else {
      throw new Error("Unsupported file format. Please upload CSV or Excel files.")
    }
  }

  private parseCSV(content: string): string[][] {
    const lines = content.split(/\r?\n/)
    const rows: string[][] = []

    for (const line of lines) {
      if (line.trim() === "") continue

      // Simple CSV parsing - handles quoted fields
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
      rows.push(row)
    }

    return rows
  }

  private parseExcel(buffer: ArrayBuffer): string[][] {
    try {
      // Simple Excel parsing using basic binary analysis
      // This is a simplified approach - in production, you'd use a library like xlsx
      const view = new Uint8Array(buffer)

      // For now, we'll throw an error asking users to convert to CSV
      // In a real implementation, you'd use the xlsx library
      throw new Error(
        "Excel files are not fully supported yet. Please convert your Excel file to CSV format and try again.",
      )
    } catch (error) {
      throw new Error("Failed to parse Excel file. Please convert to CSV format and try again.")
    }
  }

  private findHeaderRow(rows: string[][]): number {
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const row = rows[i]
      for (const cell of row) {
        if (
          typeof cell === "string" &&
          (cell.toLowerCase().includes("scheme name") ||
            cell.toLowerCase().includes("fund name") ||
            cell.toLowerCase().includes("investment name") ||
            cell.toLowerCase().includes("security name"))
        ) {
          return i
        }
      }
    }
    return -1
  }

  private mapColumns(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {}

    for (const [key, possibleNames] of Object.entries(this.columnMappings)) {
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i]?.toLowerCase().trim()
        if (possibleNames.some((name) => header.includes(name.toLowerCase()))) {
          mapping[key] = i
          break
        }
      }
    }

    return mapping
  }

  private parseDataRows(
    rows: string[][],
    columnMapping: Record<string, number>,
    headers: string[],
  ): ParsedPortfolioData[] {
    const parsedData: ParsedPortfolioData[] = []

    for (const row of rows) {
      if (row.length === 0 || row.every((cell) => !cell || cell.trim() === "")) {
        continue
      }

      try {
        const schemeName = this.getStringValue(row, columnMapping.schemeName)
        const investedValue = this.getNumericValue(row, columnMapping.investedValue)
        const currentValue = this.getNumericValue(row, columnMapping.currentValue)

        // Skip rows without essential data
        if (!schemeName || schemeName === "Unknown Scheme" || (investedValue === 0 && currentValue === 0)) {
          continue
        }

        const data: ParsedPortfolioData = {
          schemeName: schemeName,
          amc: this.getStringValue(row, columnMapping.amc) || "Unknown AMC",
          category: this.getStringValue(row, columnMapping.category) || "Unknown Category",
          subCategory: this.getStringValue(row, columnMapping.subCategory) || "Unknown Sub-category",
          folioNo: this.getStringValue(row, columnMapping.folioNo) || "N/A",
          source: this.getStringValue(row, columnMapping.source) || "Unknown Source",
          units: this.getNumericValue(row, columnMapping.units) || 0,
          investedValue: investedValue,
          currentValue: currentValue,
          returns: this.getNumericValue(row, columnMapping.returns) || currentValue - investedValue,
          xirr: this.getNumericValue(row, columnMapping.xirr) || 0,
        }

        parsedData.push(data)
      } catch (error) {
        console.warn("Error parsing row:", row, error)
      }
    }

    return parsedData
  }

  private getStringValue(row: string[], index: number): string {
    if (index === undefined || index < 0 || index >= row.length) return ""
    return row[index]?.toString().trim() || ""
  }

  private getNumericValue(row: string[], index: number): number {
    if (index === undefined || index < 0 || index >= row.length) return 0

    const value = row[index]?.toString().trim()
    if (!value) return 0

    // Remove common currency symbols and formatting
    const cleanValue = value.replace(/[₹,$,\s%]/g, "").replace(/[()]/g, "-")
    const numValue = Number.parseFloat(cleanValue)

    return isNaN(numValue) ? 0 : numValue
  }

  private calculateSummary(data: ParsedPortfolioData[]) {
    const totalInvested = data.reduce((sum, item) => sum + item.investedValue, 0)
    const totalCurrent = data.reduce((sum, item) => sum + item.currentValue, 0)
    const totalReturns = totalCurrent - totalInvested

    // Calculate weighted average XIRR
    const totalInvestedForXIRR = data
      .filter((item) => item.xirr !== 0)
      .reduce((sum, item) => sum + item.investedValue, 0)
    const weightedXIRR = data.reduce((sum, item) => {
      if (item.xirr !== 0 && totalInvestedForXIRR > 0) {
        return sum + (item.xirr * item.investedValue) / totalInvestedForXIRR
      }
      return sum
    }, 0)

    return {
      totalInvested,
      totalCurrent,
      totalReturns,
      averageXIRR: weightedXIRR,
      schemeCount: data.length,
    }
  }

  private calculateCategoryBreakdown(data: ParsedPortfolioData[]) {
    const breakdown: Record<string, { invested: number; current: number; returns: number; count: number }> = {}

    for (const item of data) {
      if (!breakdown[item.category]) {
        breakdown[item.category] = { invested: 0, current: 0, returns: 0, count: 0 }
      }

      breakdown[item.category].invested += item.investedValue
      breakdown[item.category].current += item.currentValue
      breakdown[item.category].returns += item.returns
      breakdown[item.category].count += 1
    }

    return breakdown
  }

  private calculateAMCBreakdown(data: ParsedPortfolioData[]) {
    const breakdown: Record<string, { invested: number; current: number; returns: number; count: number }> = {}

    for (const item of data) {
      if (!breakdown[item.amc]) {
        breakdown[item.amc] = { invested: 0, current: 0, returns: 0, count: 0 }
      }

      breakdown[item.amc].invested += item.investedValue
      breakdown[item.amc].current += item.currentValue
      breakdown[item.amc].returns += item.returns
      breakdown[item.amc].count += 1
    }

    return breakdown
  }

  // Method to add manual entries
  addManualEntry(entry: ManualPortfolioEntry): ParsedPortfolioData {
    const returns = entry.currentValue - entry.investedValue
    const returnPercentage = entry.investedValue > 0 ? (returns / entry.investedValue) * 100 : 0

    return {
      schemeName: entry.schemeName,
      amc: entry.amc,
      category: entry.category,
      subCategory: "Manual Entry",
      folioNo: entry.id,
      source: "Manual Entry",
      units: 1,
      investedValue: entry.investedValue,
      currentValue: entry.currentValue,
      returns: returns,
      xirr: returnPercentage,
    }
  }
}

export const portfolioParser = new PortfolioParser()
export type { PortfolioParseResult, ParsedPortfolioData, ManualPortfolioEntry }
