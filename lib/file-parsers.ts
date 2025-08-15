import Papa from "papaparse"

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
  generic: ["name", "quantity", "price", "value"],
}

function detectBroker(headers: string[]): string {
  const lowerHeaders = headers.map((h) => h.toLowerCase().replace(/\s+/g, "_"))

  for (const [broker, patterns] of Object.entries(BROKER_PATTERNS)) {
    const matches = patterns.filter((pattern) => lowerHeaders.some((header) => header.includes(pattern)))
    if (matches.length >= 3) {
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
    .filter((entry) => entry.units > 0)
}

function parseGrowwCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const units = Number.parseFloat(row.units || row.Units || "0")
      const nav = Number.parseFloat(row.nav || row.NAV || "0")
      const currentValue = Number.parseFloat(row.current_value || row["Current Value"] || "0")
      const invested = Number.parseFloat(row.invested_value || row["Invested Value"] || units * nav)

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
    .filter((entry) => entry.units > 0)
}

function parseHDFCCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const quantity = Number.parseFloat(row.quantity || row.Quantity || "0")
      const rate = Number.parseFloat(row.rate || row.Rate || row.price || "0")
      const marketValue = Number.parseFloat(row.market_value || row["Market Value"] || "0")
      const invested = quantity * rate

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
    .filter((entry) => entry.units > 0)
}

function parseAngelCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const qty = Number.parseFloat(row.qty || row.Qty || row.quantity || row.Quantity || "0")
      const avgPrice = Number.parseFloat(row.avg_price || row["Avg Price"] || "0")
      const ltp = Number.parseFloat(row.ltp || row.LTP || "0")
      const invested = qty * avgPrice
      const current = qty * ltp

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
    .filter((entry) => entry.units > 0)
}

function parseGenericCSV(data: any[]): ParsedPortfolioEntry[] {
  return data
    .map((row, index) => {
      const quantity = Number.parseFloat(row.quantity || row.Quantity || row.units || row.Units || "0")
      const price = Number.parseFloat(row.price || row.Price || row.nav || row.NAV || "0")
      const value = Number.parseFloat(row.value || row.Value || row.current_value || "0")
      const invested = Number.parseFloat(row.invested || row.Invested || quantity * price)
      const current = value || quantity * price

      return {
        id: `generic-${index}`,
        name: row.name || row.Name || row.symbol || row.Symbol || "Unknown",
        type: "stock" as const,
        invested,
        current,
        units: quantity,
        nav: price,
        date: new Date().toISOString().split("T")[0],
        source: "upload" as const,
        fileName: "",
        broker: "Unknown",
      }
    })
    .filter((entry) => entry.units > 0)
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
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              resolve({
                success: false,
                data: [],
                errors: results.errors.map((e) => e.message),
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
              default:
                parsedData = parseGenericCSV(results.data)
            }

            // Add fileName to all entries
            parsedData = parsedData.map((entry) => ({
              ...entry,
              fileName,
            }))

            resolve({
              success: true,
              data: parsedData,
              errors: [],
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
        },
      })
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
