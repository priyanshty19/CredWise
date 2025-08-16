import * as XLSX from "xlsx"

export interface ParsedPortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "etf"
  invested: number
  current: number
  units: number
  nav: number
  date: string
  source: "upload"
  fileName: string
  broker?: string
  folio?: string
  isin?: string
}

export interface ParseResult {
  success: boolean
  data: ParsedPortfolioEntry[]
  errors: string[]
  broker?: string
  totalParsed: number
  detectedTableRange?: string
  sheetName?: string
}

// Enhanced broker detection patterns with synonyms
const BROKER_PATTERNS = {
  zerodha: [
    "tradingsymbol",
    "trading_symbol",
    "symbol",
    "scrip",
    "exchange",
    "quantity",
    "qty",
    "units",
    "average_price",
    "avg_price",
    "buy_price",
    "purchase_price",
    "ltp",
    "last_traded_price",
    "current_price",
    "market_price",
  ],
  groww: [
    // Mutual Fund headers
    "scheme_name",
    "scheme",
    "fund_name",
    "investment_name",
    "amc",
    "category",
    "sub_category",
    "subcategory",
    "sub-category",
    "folio_no",
    "folio_number",
    "folio",
    "source",
    "units",
    "quantity",
    "qty",
    "invested_value",
    "invested_amount",
    "purchase_value",
    "current_value",
    "market_value",
    "present_value",
    "returns",
    "return",
    "xirr",
    // Stock headers
    "stock_name",
    "stockname",
    "isin",
    "average_buy_price",
    "averagebuyprice",
    "avg_buy_price",
    "buy_value",
    "buyvalue",
    "closing_price",
    "closingprice",
    "closing_value",
    "closingvalue",
    "unrealised_p_l",
    "unrealised_pl",
    "unrealisedpl",
    "pnl",
    "profit_loss",
  ],
  hdfc: [
    "scrip_name",
    "scrip",
    "symbol",
    "security_name",
    "quantity",
    "qty",
    "units",
    "shares",
    "rate",
    "price",
    "avg_price",
    "purchase_price",
    "market_value",
    "current_value",
    "market_price",
  ],
  angel: [
    "symbol",
    "scrip",
    "security_name",
    "qty",
    "quantity",
    "units",
    "shares",
    "avg_price",
    "average_price",
    "buy_price",
    "ltp",
    "last_price",
    "current_price",
    "market_price",
    "pnl",
    "profit_loss",
    "gain_loss",
  ],
  kuvera: [
    "scheme",
    "fund_name",
    "scheme_name",
    "folio",
    "folio_number",
    "folio_no",
    "units",
    "quantity",
    "qty",
    "nav",
    "net_asset_value",
    "price",
    "value",
    "current_value",
    "market_value",
  ],
  coin: [
    "fund_name",
    "scheme_name",
    "scheme",
    "units",
    "quantity",
    "qty",
    "nav",
    "net_asset_value",
    "price",
    "invested_value",
    "purchase_value",
    "current_value",
    "market_value",
    "present_value",
  ],
  paytm: [
    "scheme_name",
    "fund_name",
    "scheme",
    "units",
    "quantity",
    "qty",
    "purchase_nav",
    "buy_nav",
    "avg_nav",
    "current_nav",
    "nav",
    "price",
    "current_value",
    "market_value",
    "present_value",
  ],
  generic: [
    "name",
    "scheme",
    "symbol",
    "fund",
    "security",
    "quantity",
    "units",
    "qty",
    "shares",
    "price",
    "nav",
    "rate",
    "value",
    "amount",
  ],
}

// Common financial data indicators
const FINANCIAL_KEYWORDS = [
  "scheme",
  "fund",
  "symbol",
  "scrip",
  "security",
  "investment",
  "stock",
  "nav",
  "price",
  "rate",
  "ltp",
  "value",
  "amount",
  "units",
  "quantity",
  "qty",
  "shares",
  "folio",
  "isin",
  "current",
  "invested",
  "market",
  "gain",
  "loss",
  "profit",
  "pnl",
  "return",
  "returns",
  "xirr",
  "amc",
  "category",
  "closing",
  "buy",
  "average",
  "unrealised",
  "realised",
]

interface TableDetectionResult {
  headerRow: number
  dataStartRow: number
  headers: string[]
  dataRange: { start: number; end: number }
  confidence: number
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove special characters like &, /, etc.
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .replace(/^_|_$/g, "") // Remove leading/trailing underscores
    .replace(/p_l$/, "pl") // Convert "p_l" to "pl" for P&L columns
    .replace(/p_and_l/, "pl") // Convert "p_and_l" to "pl"
}

function detectBroker(headers: string[]): string {
  const normalizedHeaders = headers.map(normalizeHeader)

  let bestMatch = { broker: "generic", score: 0 }

  for (const [broker, patterns] of Object.entries(BROKER_PATTERNS)) {
    const normalizedPatterns = patterns.map(normalizeHeader)

    const matches = normalizedPatterns.filter((pattern) =>
      normalizedHeaders.some(
        (header) =>
          header.includes(pattern) ||
          pattern.includes(header) ||
          // Fuzzy matching for similar terms
          (pattern.length > 3 &&
            header.length > 3 &&
            (pattern.includes(header.substring(0, 4)) || header.includes(pattern.substring(0, 4)))),
      ),
    )

    const score = matches.length
    if (score > bestMatch.score && score >= 2) {
      bestMatch = { broker, score }
    }
  }

  return bestMatch.broker
}

function detectTableInSheet(worksheet: XLSX.WorkSheet): TableDetectionResult | null {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1")
  const rows: any[][] = []

  // Convert worksheet to array of arrays
  for (let row = range.s.r; row <= range.e.r; row++) {
    const rowData: any[] = []
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = worksheet[cellAddress]
      rowData.push(cell ? cell.v : "")
    }
    rows.push(rowData)
  }

  let bestTable: TableDetectionResult | null = null
  let maxConfidence = 0

  // Scan each row to find potential headers
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 20); rowIndex++) {
    const row = rows[rowIndex]
    const nonEmptyValues = row.filter((cell) => cell && cell.toString().trim())

    if (nonEmptyValues.length < 3) continue // Need at least 3 columns

    const headers = row.map((cell) => (cell ? cell.toString().trim() : ""))
    const normalizedHeaders = headers.map(normalizeHeader)

    // Calculate confidence based on financial keywords
    const financialMatches = normalizedHeaders.filter((header) =>
      FINANCIAL_KEYWORDS.some((keyword) => header.includes(keyword) || keyword.includes(header)),
    ).length

    const confidence = (financialMatches / Math.max(nonEmptyValues.length, 1)) * 100

    if (confidence > 30 && confidence > maxConfidence) {
      // Find data range
      let dataEndRow = rowIndex + 1
      for (let i = rowIndex + 1; i < rows.length; i++) {
        const dataRow = rows[i]
        const nonEmptyData = dataRow.filter((cell) => cell && cell.toString().trim())
        if (nonEmptyData.length >= 2) {
          dataEndRow = i
        } else if (i > rowIndex + 5 && nonEmptyData.length === 0) {
          break // Stop if we hit empty rows after some data
        }
      }

      if (dataEndRow > rowIndex + 1) {
        // Must have at least some data rows
        bestTable = {
          headerRow: rowIndex,
          dataStartRow: rowIndex + 1,
          headers: headers.filter((h) => h),
          dataRange: { start: rowIndex + 1, end: dataEndRow },
          confidence,
        }
        maxConfidence = confidence
      }
    }
  }

  return bestTable
}

function parseExcelSheet(worksheet: XLSX.WorkSheet, fileName: string): ParseResult {
  try {
    const tableInfo = detectTableInSheet(worksheet)

    if (!tableInfo) {
      return {
        success: false,
        data: [],
        errors: [
          "Could not detect a valid data table in the sheet. Please ensure your file contains a table with portfolio holdings.",
        ],
        totalParsed: 0,
      }
    }

    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1")
    const data: any[] = []

    // Extract data rows
    for (let row = tableInfo.dataRange.start; row <= Math.min(tableInfo.dataRange.end, range.e.r); row++) {
      const rowData: any = {}
      let hasData = false

      for (let col = range.s.c; col <= range.e.c && col < tableInfo.headers.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = worksheet[cellAddress]
        const header = tableInfo.headers[col]

        if (header && cell && cell.v !== undefined && cell.v !== null && cell.v !== "") {
          rowData[header] = cell.v
          hasData = true
        }
      }

      if (hasData) {
        data.push(rowData)
      }
    }

    if (data.length === 0) {
      return {
        success: false,
        data: [],
        errors: ["No data rows found in the detected table."],
        totalParsed: 0,
      }
    }

    const broker = detectBroker(tableInfo.headers)
    let parsedData: ParsedPortfolioEntry[] = []

    switch (broker) {
      case "zerodha":
        parsedData = parseZerodhaData(data, fileName)
        break
      case "groww":
        parsedData = parseGrowwData(data, fileName)
        break
      case "hdfc":
        parsedData = parseHDFCData(data, fileName)
        break
      case "angel":
        parsedData = parseAngelData(data, fileName)
        break
      case "kuvera":
        parsedData = parseKuveraData(data, fileName)
        break
      case "coin":
        parsedData = parseCoinData(data, fileName)
        break
      default:
        parsedData = parseGenericData(data, fileName)
    }

    return {
      success: parsedData.length > 0,
      data: parsedData,
      errors: parsedData.length === 0 ? ["No valid investment data could be parsed from the detected table."] : [],
      broker: broker === "generic" ? "Unknown" : broker,
      totalParsed: parsedData.length,
      detectedTableRange: `Rows ${tableInfo.headerRow + 1}-${tableInfo.dataRange.end + 1}`,
      sheetName: worksheet.name,
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`Error parsing Excel sheet: ${error instanceof Error ? error.message : "Unknown error"}`],
      totalParsed: 0,
    }
  }
}

function findColumnValue(row: any, possibleNames: string[]): string {
  for (const name of possibleNames) {
    const normalizedName = normalizeHeader(name)
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = normalizeHeader(key)

      // Exact match
      if (normalizedKey === normalizedName) {
        return value?.toString() || ""
      }

      // Contains match
      if (normalizedKey.includes(normalizedName) || normalizedName.includes(normalizedKey)) {
        return value?.toString() || ""
      }

      // Special handling for Groww headers that might have spaces removed
      if (normalizedName.replace(/_/g, "") === normalizedKey.replace(/_/g, "")) {
        return value?.toString() || ""
      }
    }
  }
  return ""
}

function findNumericValue(row: any, possibleNames: string[]): number {
  const value = findColumnValue(row, possibleNames)
  const numValue = Number.parseFloat(value.replace(/[^\d.-]/g, "")) // Remove currency symbols, commas
  return isNaN(numValue) ? 0 : numValue
}

function isValidEntry(name: string, units: number, value: number): boolean {
  // More strict validation to prevent invalid entries
  return (
    name &&
    name.trim().length > 0 &&
    name.toLowerCase() !== "total" &&
    name.toLowerCase() !== "grand total" &&
    !name.toLowerCase().includes("summary") &&
    units > 0 &&
    value > 0 &&
    !isNaN(units) &&
    !isNaN(value)
  )
}

function parseZerodhaData(data: any[], fileName: string): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const quantity = findNumericValue(row, ["quantity", "qty", "units", "shares"])
      const avgPrice = findNumericValue(row, ["average_price", "avg_price", "buy_price", "purchase_price"])
      const ltp = findNumericValue(row, ["ltp", "last_traded_price", "current_price", "market_price"])
      const name = findColumnValue(row, ["tradingsymbol", "trading_symbol", "symbol", "scrip", "instrument"])

      if (!isValidEntry(name, quantity, avgPrice)) return null

      const invested = quantity * avgPrice
      const current = quantity * ltp

      return {
        id: `zerodha-${index}`,
        name,
        type: "stock" as const,
        invested,
        current,
        units: quantity,
        nav: ltp,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName,
        broker: "Zerodha",
        isin: findColumnValue(row, ["isin", "ISIN"]),
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseGrowwData(data: any[], fileName: string): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      // Check if this is a Mutual Fund row (has Scheme Name)
      const schemeName = findColumnValue(row, ["scheme_name", "scheme", "fund_name"])
      const stockName = findColumnValue(row, ["stock_name", "stockname"])

      if (schemeName) {
        // Parse as Mutual Fund
        const units = findNumericValue(row, ["units", "quantity", "qty"])
        const investedValue = findNumericValue(row, ["invested_value", "invested_amount", "purchase_value"])
        const currentValue = findNumericValue(row, ["current_value", "market_value", "present_value"])
        const amc = findColumnValue(row, ["amc"])
        const category = findColumnValue(row, ["category"])
        const subCategory = findColumnValue(row, ["sub_category", "subcategory", "sub-category"])
        const folioNo = findColumnValue(row, ["folio_no", "folio_number", "folio"])
        const source = findColumnValue(row, ["source"])

        if (!isValidEntry(schemeName, units, investedValue)) return null

        const nav = currentValue > 0 && units > 0 ? currentValue / units : investedValue / units

        return {
          id: `groww-mf-${index}`,
          name: schemeName,
          type: "mutual_fund" as const,
          invested: investedValue,
          current: currentValue || investedValue,
          units,
          nav,
          date: new Date().toISOString().split("T")[0],
          source: "upload" as const,
          fileName,
          broker: "Groww",
          folio: folioNo,
        }
      } else if (stockName) {
        // Parse as Stock
        const quantity = findNumericValue(row, ["quantity", "qty", "units"])
        const averageBuyPrice = findNumericValue(row, ["average_buy_price", "averagebuyprice", "avg_buy_price"])
        const buyValue = findNumericValue(row, ["buy_value", "buyvalue"])
        const closingPrice = findNumericValue(row, ["closing_price", "closingprice", "current_price"])
        const closingValue = findNumericValue(row, ["closing_value", "closingvalue", "current_value"])
        const isin = findColumnValue(row, ["isin", "ISIN"])

        if (!isValidEntry(stockName, quantity, averageBuyPrice)) return null

        const invested = buyValue || quantity * averageBuyPrice
        const current = closingValue || quantity * closingPrice

        return {
          id: `groww-stock-${index}`,
          name: stockName,
          type: "stock" as const,
          invested,
          current,
          units: quantity,
          nav: closingPrice || averageBuyPrice,
          date: new Date().toISOString().split("T")[0],
          source: "upload" as const,
          fileName,
          broker: "Groww",
          isin,
        }
      }

      return null
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseHDFCData(data: any[], fileName: string): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const quantity = findNumericValue(row, ["quantity", "qty", "units", "shares"])
      const rate = findNumericValue(row, ["rate", "price", "avg_price", "purchase_price"])
      const marketValue = findNumericValue(row, ["market_value", "current_value"])
      const name = findColumnValue(row, ["scrip_name", "scrip", "symbol", "security_name"])

      if (!isValidEntry(name, quantity, rate)) return null

      const invested = quantity * rate
      const current = marketValue || invested

      return {
        id: `hdfc-${index}`,
        name,
        type: "stock" as const,
        invested,
        current,
        units: quantity,
        nav: rate,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName,
        broker: "HDFC Securities",
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseAngelData(data: any[], fileName: string): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const qty = findNumericValue(row, ["qty", "quantity", "units", "shares"])
      const avgPrice = findNumericValue(row, ["avg_price", "average_price", "buy_price"])
      const ltp = findNumericValue(row, ["ltp", "last_price", "current_price", "market_price"])
      const name = findColumnValue(row, ["symbol", "scrip", "security_name"])

      if (!isValidEntry(name, qty, avgPrice)) return null

      const invested = qty * avgPrice
      const current = qty * ltp

      return {
        id: `angel-${index}`,
        name,
        type: "stock" as const,
        invested,
        current,
        units: qty,
        nav: ltp,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName,
        broker: "Angel One",
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseKuveraData(data: any[], fileName: string): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const units = findNumericValue(row, ["units", "quantity", "qty"])
      const nav = findNumericValue(row, ["nav", "net_asset_value", "price"])
      const value = findNumericValue(row, ["value", "current_value", "market_value"])
      const name = findColumnValue(row, ["scheme", "fund_name", "scheme_name"])

      if (!isValidEntry(name, units, nav)) return null

      const invested = units * nav
      const current = value || invested

      return {
        id: `kuvera-${index}`,
        name,
        type: "mutual_fund" as const,
        invested,
        current,
        units,
        nav,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName,
        broker: "Kuvera",
        folio: findColumnValue(row, ["folio", "folio_number"]),
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseCoinData(data: any[], fileName: string): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const units = findNumericValue(row, ["units", "quantity", "qty"])
      const nav = findNumericValue(row, ["nav", "net_asset_value", "price"])
      const currentValue = findNumericValue(row, ["current_value", "market_value", "present_value"])
      const investedValue = findNumericValue(row, ["invested_value", "purchase_value"])
      const name = findColumnValue(row, ["fund_name", "scheme_name", "scheme"])

      if (!isValidEntry(name, units, nav)) return null

      const invested = investedValue || units * nav
      const current = currentValue || units * nav

      return {
        id: `coin-${index}`,
        name,
        type: "mutual_fund" as const,
        invested,
        current,
        units,
        nav,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName,
        broker: "Coin (Zerodha)",
        folio: findColumnValue(row, ["folio", "folio_number"]),
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseGenericData(data: any[], fileName: string): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const keys = Object.keys(row)

      // Find name column
      const nameKey =
        keys.find((k) => {
          const normalized = normalizeHeader(k)
          return ["name", "scheme", "fund", "symbol", "scrip", "security", "investment"].some(
            (term) => normalized.includes(term) || term.includes(normalized),
          )
        }) || keys[0]

      // Find units column
      const unitsKey = keys.find((k) => {
        const normalized = normalizeHeader(k)
        return ["units", "quantity", "qty", "shares"].some(
          (term) => normalized.includes(term) || term.includes(normalized),
        )
      })

      // Find price column
      const priceKey = keys.find((k) => {
        const normalized = normalizeHeader(k)
        return ["nav", "price", "rate", "value"].some((term) => normalized.includes(term) || term.includes(normalized))
      })

      const name = row[nameKey]?.toString() || "Unknown"
      const units = findNumericValue(row, [unitsKey || "units"])
      const price = findNumericValue(row, [priceKey || "price"])

      if (!isValidEntry(name, units, price)) return null

      const invested = units * price
      const current = invested

      return {
        id: `generic-${index}`,
        name,
        type: "mutual_fund" as const,
        invested,
        current,
        units,
        nav: price,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName,
        broker: "Unknown",
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

async function parseCSVFile(file: File): Promise<ParseResult> {
  const text = await file.text()

  return new Promise((resolve) => {
    // Try different CSV parsing configurations
    const parseConfigs = [
      { header: true, skipEmptyLines: true, delimiter: "," },
      { header: true, skipEmptyLines: true, delimiter: ";" },
      { header: true, skipEmptyLines: true, delimiter: "\t" },
    ]

    let bestResult: any = null
    let bestScore = 0

    const tryParse = async (configIndex: number) => {
      if (configIndex >= parseConfigs.length) {
        if (bestResult && bestResult.data.length > 0) {
          processBestResult(bestResult)
        } else {
          resolve({
            success: false,
            data: [],
            errors: ["Could not parse CSV file. Please check the file format."],
            totalParsed: 0,
          })
        }
        return
      }

      const config = parseConfigs[configIndex]

      try {
        const Papa = await import("papaparse")
        Papa.parse(text, {
          ...config,
          complete: (results) => {
            const score = scoreParseResult(results)
            if (score > bestScore && results.data.length > 0) {
              bestScore = score
              bestResult = results
            }
            tryParse(configIndex + 1)
          },
          error: () => tryParse(configIndex + 1),
        })
      } catch {
        // Fallback manual parsing
        const lines = text.split("\n").filter((line) => line.trim())
        if (lines.length >= 2) {
          const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
          const data = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
            const row: any = {}
            headers.forEach((header, index) => {
              row[header] = values[index] || ""
            })
            return row
          })
          processBestResult({ data, errors: [] })
        } else {
          tryParse(configIndex + 1)
        }
      }
    }

    const scoreParseResult = (results: any): number => {
      let score = results.data.length
      if (results.errors?.length > 0) score -= results.errors.length * 10

      if (results.data.length > 0) {
        const headers = Object.keys(results.data[0])
        const financialMatches = headers.filter((header) =>
          FINANCIAL_KEYWORDS.some(
            (keyword) => normalizeHeader(header).includes(keyword) || keyword.includes(normalizeHeader(header)),
          ),
        ).length
        score += financialMatches * 5
      }

      return score
    }

    const processBestResult = (results: any) => {
      try {
        if (!results.data || results.data.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ["No data found in CSV file"],
            totalParsed: 0,
          })
          return
        }

        const headers = Object.keys(results.data[0] || {})
        const broker = detectBroker(headers)
        let parsedData: ParsedPortfolioEntry[] = []

        switch (broker) {
          case "zerodha":
            parsedData = parseZerodhaData(results.data, file.name)
            break
          case "groww":
            parsedData = parseGrowwData(results.data, file.name)
            break
          case "hdfc":
            parsedData = parseHDFCData(results.data, file.name)
            break
          case "angel":
            parsedData = parseAngelData(results.data, file.name)
            break
          case "kuvera":
            parsedData = parseKuveraData(results.data, file.name)
            break
          case "coin":
            parsedData = parseCoinData(results.data, file.name)
            break
          default:
            parsedData = parseGenericData(results.data, file.name)
        }

        resolve({
          success: parsedData.length > 0,
          data: parsedData,
          errors: parsedData.length === 0 ? ["No valid investment data found in CSV file"] : [],
          broker: broker === "generic" ? "Unknown" : broker,
          totalParsed: parsedData.length,
        })
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [`Error parsing CSV: ${error instanceof Error ? error.message : "Unknown error"}`],
          totalParsed: 0,
        })
      }
    }

    tryParse(0)
  })
}

export async function parsePortfolioFile(file: File): Promise<ParseResult> {
  try {
    const fileName = file.name
    const fileExtension = fileName.split(".").pop()?.toLowerCase()

    if (!["csv", "xlsx", "xls"].includes(fileExtension || "")) {
      return {
        success: false,
        data: [],
        errors: [`Unsupported file format: ${fileExtension}. Please upload CSV or Excel files.`],
        totalParsed: 0,
      }
    }

    if (fileExtension === "csv") {
      return await parseCSVFile(file)
    }

    // Handle Excel files
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        data: [],
        errors: ["No sheets found in Excel file"],
        totalParsed: 0,
      }
    }

    // Try each sheet to find the best one with portfolio data
    let bestResult: ParseResult | null = null
    let bestScore = 0

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const result = parseExcelSheet(worksheet, fileName)

      // Score based on success and number of parsed entries
      const score = result.success ? result.totalParsed * 10 : 0

      if (score > bestScore) {
        bestScore = score
        bestResult = { ...result, sheetName }
      }
    }

    if (bestResult && bestResult.success) {
      return bestResult
    }

    // If no sheet worked, return a helpful error
    return {
      success: false,
      data: [],
      errors: [
        "We couldn't detect valid portfolio data in your Excel file.",
        "Please ensure your statement contains a table with your holdings.",
        "Supported columns include: Scheme Name, Units, NAV, Current Value, Invested Value.",
        "The table should have clear headers and data rows below them.",
      ],
      totalParsed: 0,
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`Error reading file: ${error instanceof Error ? error.message : "Unknown error"}`],
      totalParsed: 0,
    }
  }
}
