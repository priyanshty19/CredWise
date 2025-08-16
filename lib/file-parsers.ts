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
}

// Broker detection patterns
const BROKER_PATTERNS = {
  zerodha: ["tradingsymbol", "exchange", "quantity", "average_price", "ltp"],
  groww: ["scheme_name", "folio_number", "units", "nav", "current_value"],
  hdfc: ["scrip_name", "quantity", "rate", "market_value"],
  angel: ["symbol", "qty", "avg_price", "ltp", "pnl"],
  kuvera: ["scheme", "folio", "units", "nav", "value"],
  coin: ["fund_name", "units", "nav", "invested_value", "current_value"],
  paytm: ["scheme_name", "units", "purchase_nav", "current_nav", "current_value"],
  generic: ["name", "quantity", "price", "value"],
}

function detectBroker(headers: string[]): string {
  const lowerHeaders = headers.map((h) => h.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "_"))

  for (const [broker, patterns] of Object.entries(BROKER_PATTERNS)) {
    const matches = patterns.filter((pattern) =>
      lowerHeaders.some((header) => header.includes(pattern) || pattern.includes(header)),
    )
    if (matches.length >= 2) {
      return broker
    }
  }

  return "generic"
}

function parseZerodhaCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const quantity = Number.parseFloat(row.quantity || row.Quantity || "0")
      const avgPrice = Number.parseFloat(row.average_price || row["Average Price"] || "0")
      const ltp = Number.parseFloat(row.ltp || row.LTP || row["Last Price"] || "0")
      const invested = quantity * avgPrice
      const current = quantity * ltp

      if (quantity <= 0 || avgPrice <= 0) return null

      return {
        id: `zerodha-${index}`,
        name: row.tradingsymbol || row["Trading Symbol"] || row.instrument || "Unknown",
        type: (row.exchange || "").toLowerCase().includes("nse") ? "stock" : "stock",
        invested,
        current,
        units: quantity,
        nav: ltp,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName: "",
        broker: "Zerodha",
        isin: row.isin || row.ISIN,
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseGrowwCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const units = Number.parseFloat(row.units || row.Units || "0")
      const nav = Number.parseFloat(row.nav || row.NAV || "0")
      const currentValue = Number.parseFloat(row.current_value || row["Current Value"] || "0")
      const invested = Number.parseFloat(row.invested_value || row["Invested Value"] || units * nav)

      if (units <= 0 || nav <= 0) return null

      return {
        id: `groww-${index}`,
        name: row.scheme_name || row["Scheme Name"] || "Unknown Fund",
        type: "mutual_fund" as const,
        invested,
        current: currentValue || units * nav,
        units,
        nav,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName: "",
        broker: "Groww",
        folio: row.folio_number || row["Folio Number"],
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseHDFCCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const quantity = Number.parseFloat(row.quantity || row.Quantity || "0")
      const rate = Number.parseFloat(row.rate || row.Rate || row.price || "0")
      const marketValue = Number.parseFloat(row.market_value || row["Market Value"] || "0")
      const invested = quantity * rate

      if (quantity <= 0 || rate <= 0) return null

      return {
        id: `hdfc-${index}`,
        name: row.scrip_name || row["Scrip Name"] || row.symbol || "Unknown",
        type: "stock" as const,
        invested,
        current: marketValue || invested,
        units: quantity,
        nav: rate,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName: "",
        broker: "HDFC Securities",
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseAngelCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const qty = Number.parseFloat(row.qty || row.Qty || row.quantity || row.Quantity || "0")
      const avgPrice = Number.parseFloat(row.avg_price || row["Avg Price"] || "0")
      const ltp = Number.parseFloat(row.ltp || row.LTP || "0")
      const invested = qty * avgPrice
      const current = qty * ltp

      if (qty <= 0 || avgPrice <= 0) return null

      return {
        id: `angel-${index}`,
        name: row.symbol || row.Symbol || "Unknown",
        type: "stock" as const,
        invested,
        current,
        units: qty,
        nav: ltp,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName: "",
        broker: "Angel One",
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseKuveraCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const units = Number.parseFloat(row.units || row.Units || "0")
      const nav = Number.parseFloat(row.nav || row.NAV || "0")
      const value = Number.parseFloat(row.value || row.Value || row.current_value || "0")
      const invested = Number.parseFloat(row.invested || row.Invested || units * nav)

      if (units <= 0 || nav <= 0) return null

      return {
        id: `kuvera-${index}`,
        name: row.scheme || row.Scheme || row.fund_name || "Unknown Fund",
        type: "mutual_fund" as const,
        invested,
        current: value || units * nav,
        units,
        nav,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName: "",
        broker: "Kuvera",
        folio: row.folio || row.Folio,
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseCoinCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const units = Number.parseFloat(row.units || row.Units || "0")
      const nav = Number.parseFloat(row.nav || row.NAV || "0")
      const currentValue = Number.parseFloat(row.current_value || row["Current Value"] || "0")
      const investedValue = Number.parseFloat(row.invested_value || row["Invested Value"] || "0")

      if (units <= 0 || nav <= 0) return null

      return {
        id: `coin-${index}`,
        name: row.fund_name || row["Fund Name"] || row.scheme_name || "Unknown Fund",
        type: "mutual_fund" as const,
        invested: investedValue || units * nav,
        current: currentValue || units * nav,
        units,
        nav,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName: "",
        broker: "Coin (Zerodha)",
        folio: row.folio || row.Folio,
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
}

function parseGenericCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      // Try to find relevant columns by checking common names
      const keys = Object.keys(row)

      // Find name column
      const nameKey =
        keys.find(
          (k) =>
            k.toLowerCase().includes("name") ||
            k.toLowerCase().includes("scheme") ||
            k.toLowerCase().includes("fund") ||
            k.toLowerCase().includes("symbol") ||
            k.toLowerCase().includes("scrip"),
        ) || keys[0]

      // Find units/quantity column
      const unitsKey = keys.find(
        (k) =>
          k.toLowerCase().includes("units") || k.toLowerCase().includes("quantity") || k.toLowerCase().includes("qty"),
      )

      // Find NAV/price column
      const navKey = keys.find(
        (k) => k.toLowerCase().includes("nav") || k.toLowerCase().includes("price") || k.toLowerCase().includes("rate"),
      )

      // Find value column
      const valueKey = keys.find((k) => k.toLowerCase().includes("value") || k.toLowerCase().includes("amount"))

      const name = row[nameKey] || "Unknown"
      const units = Number.parseFloat(row[unitsKey] || "0")
      const nav = Number.parseFloat(row[navKey] || "0")
      const value = Number.parseFloat(row[valueKey] || "0")

      const invested = units * nav
      const current = value || invested

      if (units <= 0 || nav <= 0) return null

      return {
        id: `generic-${index}`,
        name,
        type: "mutual_fund" as const,
        invested,
        current,
        units,
        nav,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName: "",
        broker: "Unknown",
      }
    })
    .filter((entry): entry is ParsedPortfolioEntry => entry !== null)
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

    // For now, we'll focus on CSV parsing
    if (fileExtension !== "csv") {
      return {
        success: false,
        data: [],
        errors: ["Excel files not yet supported. Please export as CSV and upload."],
        totalParsed: 0,
      }
    }

    const text = await file.text()

    return new Promise((resolve) => {
      // First, let's try to parse with different configurations
      const parseConfigs = [
        // Standard CSV with headers
        {
          header: true,
          skipEmptyLines: true,
          delimiter: ",",
          quoteChar: '"',
          escapeChar: '"',
        },
        // Try with semicolon delimiter
        {
          header: true,
          skipEmptyLines: true,
          delimiter: ";",
          quoteChar: '"',
          escapeChar: '"',
        },
        // Try with tab delimiter
        {
          header: true,
          skipEmptyLines: true,
          delimiter: "\t",
          quoteChar: '"',
          escapeChar: '"',
        },
        // Try without headers (in case first row is not headers)
        {
          header: false,
          skipEmptyLines: true,
          delimiter: ",",
          quoteChar: '"',
          escapeChar: '"',
        },
      ]

      let bestResult: any = null
      let bestScore = 0

      const tryParse = (configIndex: number) => {
        if (configIndex >= parseConfigs.length) {
          // All configs tried, use best result
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

        // Use dynamic import for Papa Parse
        import("papaparse")
          .then((Papa) => {
            Papa.parse(text, {
              ...config,
              complete: (results) => {
                // Score this result
                const score = scoreParseResult(results)

                if (score > bestScore && results.data.length > 0) {
                  bestScore = score
                  bestResult = results
                }

                // Try next config
                tryParse(configIndex + 1)
              },
              error: () => {
                // Try next config on error
                tryParse(configIndex + 1)
              },
            })
          })
          .catch(() => {
            // Fallback manual parsing if Papa Parse fails
            const lines = text.split("\n").filter((line) => line.trim())
            if (lines.length < 2) {
              resolve({
                success: false,
                data: [],
                errors: ["File appears to be empty or has insufficient data."],
                totalParsed: 0,
              })
              return
            }

            // Manual CSV parsing
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
          })
      }

      const scoreParseResult = (results: any): number => {
        let score = 0

        // Penalize errors heavily
        if (results.errors && results.errors.length > 0) {
          score -= results.errors.length * 10
        }

        // Reward more data rows
        score += results.data.length

        // Reward if we can detect headers that look like financial data
        if (results.data.length > 0) {
          const firstRow = results.data[0]
          const keys = Object.keys(firstRow)

          const financialKeywords = [
            "scheme",
            "fund",
            "nav",
            "units",
            "value",
            "folio",
            "amount",
            "symbol",
            "quantity",
            "price",
            "ltp",
            "current",
            "invested",
          ]

          const matchingKeys = keys.filter((key) =>
            financialKeywords.some((keyword) => key.toLowerCase().includes(keyword)),
          )

          score += matchingKeys.length * 5
        }

        return score
      }

      const processBestResult = (results: any) => {
        try {
          if (!results.data || results.data.length === 0) {
            resolve({
              success: false,
              data: [],
              errors: ["No data found in file"],
              totalParsed: 0,
            })
            return
          }

          const headers = Object.keys(results.data[0] || {})
          const broker = detectBroker(headers)

          let parsedData: ParsedPortfolioEntry[] = []

          switch (broker) {
            case "zerodha":
              parsedData = parseZerodhaCSV(results.data)
              break
            case "groww":
              parsedData = parseGrowwCSV(results.data)
              break
            case "hdfc":
              parsedData = parseHDFCCSV(results.data)
              break
            case "angel":
              parsedData = parseAngelCSV(results.data)
              break
            case "kuvera":
              parsedData = parseKuveraCSV(results.data)
              break
            case "coin":
              parsedData = parseCoinCSV(results.data)
              break
            default:
              parsedData = parseGenericCSV(results.data)
          }

          // Add fileName to all entries
          parsedData = parsedData.map((entry) => ({
            ...entry,
            fileName,
          }))

          resolve({
            success: parsedData.length > 0,
            data: parsedData,
            errors: parsedData.length === 0 ? ["No valid investment data found in file"] : [],
            broker: broker === "generic" ? "Unknown" : broker,
            totalParsed: parsedData.length,
          })
        } catch (error) {
          resolve({
            success: false,
            data: [],
            errors: [`Error parsing file: ${error instanceof Error ? error.message : "Unknown error"}`],
            totalParsed: 0,
          })
        }
      }

      // Start trying different parse configurations
      tryParse(0)
    })
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`Error reading file: ${error instanceof Error ? error.message : "Unknown error"}`],
      totalParsed: 0,
    }
  }
}
