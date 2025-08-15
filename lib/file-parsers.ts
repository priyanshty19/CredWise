interface ParsedInvestment {
  name: string
  type: "mutual_fund" | "stock" | "bond" | "etf"
  invested: number
  current: number
  units: number
  nav: number
  date: string
  broker?: string
  folio?: string
  isin?: string
}

interface ParseResult {
  success: boolean
  data?: ParsedInvestment[]
  error?: string
  broker?: string
  fileType?: string
}

// CSV Parser for various broker formats
export async function parseCSV(file: File): Promise<ParseResult> {
  try {
    const text = await file.text()
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)

    if (lines.length < 2) {
      return { success: false, error: "CSV file appears to be empty or invalid" }
    }

    const header = lines[0].toLowerCase()

    // Detect broker based on header patterns
    if (header.includes("zerodha") || header.includes("kite")) {
      return parseZerodhaCSV(lines)
    } else if (header.includes("groww")) {
      return parseGrowwCSV(lines)
    } else if (header.includes("hdfc") || header.includes("securities")) {
      return parseHDFCCSV(lines)
    } else if (header.includes("angel") || header.includes("angelone")) {
      return parseAngelOneCSV(lines)
    } else {
      return parseGenericCSV(lines)
    }
  } catch (error) {
    console.error("CSV parsing error:", error)
    return { success: false, error: `Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

// Zerodha Console CSV Parser
function parseZerodhaCSV(lines: string[]): ParseResult {
  try {
    const investments: ParsedInvestment[] = []
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    // Common Zerodha headers
    const symbolIndex = headers.findIndex((h) => h.includes("symbol") || h.includes("instrument"))
    const qtyIndex = headers.findIndex((h) => h.includes("qty") || h.includes("quantity"))
    const avgPriceIndex = headers.findIndex((h) => h.includes("avg") || h.includes("price"))
    const ltp = headers.findIndex((h) => h.includes("ltp") || h.includes("last"))
    const pnlIndex = headers.findIndex((h) => h.includes("pnl") || h.includes("p&l"))

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length < headers.length) continue

      const symbol = values[symbolIndex] || ""
      const quantity = Number.parseFloat(values[qtyIndex] || "0")
      const avgPrice = Number.parseFloat(values[avgPriceIndex] || "0")
      const currentPrice = Number.parseFloat(values[ltp] || "0")

      if (symbol && quantity > 0 && avgPrice > 0) {
        const invested = quantity * avgPrice
        const current = quantity * currentPrice

        investments.push({
          name: symbol,
          type: symbol.includes("-") ? "mutual_fund" : "stock",
          invested,
          current,
          units: quantity,
          nav: currentPrice,
          date: new Date().toISOString().split("T")[0],
          broker: "Zerodha",
        })
      }
    }

    return {
      success: true,
      data: investments,
      broker: "Zerodha",
      fileType: "CSV",
    }
  } catch (error) {
    return {
      success: false,
      error: `Zerodha CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Groww CSV Parser
function parseGrowwCSV(lines: string[]): ParseResult {
  try {
    const investments: ParsedInvestment[] = []
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const nameIndex = headers.findIndex((h) => h.includes("scheme") || h.includes("name"))
    const unitsIndex = headers.findIndex((h) => h.includes("units") || h.includes("quantity"))
    const navIndex = headers.findIndex((h) => h.includes("nav") || h.includes("price"))
    const valueIndex = headers.findIndex((h) => h.includes("value") || h.includes("amount"))

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length < headers.length) continue

      const name = values[nameIndex] || ""
      const units = Number.parseFloat(values[unitsIndex] || "0")
      const nav = Number.parseFloat(values[navIndex] || "0")
      const currentValue = Number.parseFloat(values[valueIndex] || "0")

      if (name && units > 0 && nav > 0) {
        const invested = currentValue // Groww usually shows current value

        investments.push({
          name,
          type: "mutual_fund",
          invested,
          current: currentValue,
          units,
          nav,
          date: new Date().toISOString().split("T")[0],
          broker: "Groww",
        })
      }
    }

    return {
      success: true,
      data: investments,
      broker: "Groww",
      fileType: "CSV",
    }
  } catch (error) {
    return {
      success: false,
      error: `Groww CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// HDFC Securities CSV Parser
function parseHDFCCSV(lines: string[]): ParseResult {
  try {
    const investments: ParsedInvestment[] = []
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const scriptIndex = headers.findIndex((h) => h.includes("script") || h.includes("symbol"))
    const qtyIndex = headers.findIndex((h) => h.includes("qty") || h.includes("holding"))
    const rateIndex = headers.findIndex((h) => h.includes("rate") || h.includes("price"))
    const marketValueIndex = headers.findIndex((h) => h.includes("market") || h.includes("value"))

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length < headers.length) continue

      const script = values[scriptIndex] || ""
      const qty = Number.parseFloat(values[qtyIndex] || "0")
      const rate = Number.parseFloat(values[rateIndex] || "0")
      const marketValue = Number.parseFloat(values[marketValueIndex] || "0")

      if (script && qty > 0 && rate > 0) {
        const invested = qty * rate

        investments.push({
          name: script,
          type: "stock",
          invested,
          current: marketValue || invested,
          units: qty,
          nav: rate,
          date: new Date().toISOString().split("T")[0],
          broker: "HDFC Securities",
        })
      }
    }

    return {
      success: true,
      data: investments,
      broker: "HDFC Securities",
      fileType: "CSV",
    }
  } catch (error) {
    return {
      success: false,
      error: `HDFC CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Angel One CSV Parser
function parseAngelOneCSV(lines: string[]): ParseResult {
  try {
    const investments: ParsedInvestment[] = []
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const symbolIndex = headers.findIndex((h) => h.includes("symbol") || h.includes("scrip"))
    const qtyIndex = headers.findIndex((h) => h.includes("qty") || h.includes("quantity"))
    const avgPriceIndex = headers.findIndex((h) => h.includes("avg") || h.includes("buy"))
    const ltpIndex = headers.findIndex((h) => h.includes("ltp") || h.includes("current"))

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length < headers.length) continue

      const symbol = values[symbolIndex] || ""
      const qty = Number.parseFloat(values[qtyIndex] || "0")
      const avgPrice = Number.parseFloat(values[avgPriceIndex] || "0")
      const ltp = Number.parseFloat(values[ltpIndex] || "0")

      if (symbol && qty > 0 && avgPrice > 0) {
        const invested = qty * avgPrice
        const current = qty * ltp

        investments.push({
          name: symbol,
          type: "stock",
          invested,
          current,
          units: qty,
          nav: ltp,
          date: new Date().toISOString().split("T")[0],
          broker: "Angel One",
        })
      }
    }

    return {
      success: true,
      data: investments,
      broker: "Angel One",
      fileType: "CSV",
    }
  } catch (error) {
    return {
      success: false,
      error: `Angel One CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Generic CSV Parser (fallback)
function parseGenericCSV(lines: string[]): ParseResult {
  try {
    const investments: ParsedInvestment[] = []
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    // Try to find common column patterns
    const nameIndex = headers.findIndex(
      (h) => h.includes("name") || h.includes("symbol") || h.includes("scheme") || h.includes("script"),
    )
    const qtyIndex = headers.findIndex(
      (h) => h.includes("qty") || h.includes("units") || h.includes("quantity") || h.includes("holding"),
    )
    const priceIndex = headers.findIndex(
      (h) => h.includes("price") || h.includes("nav") || h.includes("rate") || h.includes("avg"),
    )
    const valueIndex = headers.findIndex((h) => h.includes("value") || h.includes("amount") || h.includes("investment"))

    if (nameIndex === -1 || qtyIndex === -1) {
      return { success: false, error: "Could not identify required columns (name, quantity) in CSV" }
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length < headers.length) continue

      const name = values[nameIndex] || ""
      const qty = Number.parseFloat(values[qtyIndex] || "0")
      const price = Number.parseFloat(values[priceIndex] || "0")
      const value = Number.parseFloat(values[valueIndex] || "0")

      if (name && qty > 0) {
        const nav = price || value / qty || 1
        const invested = value || qty * nav

        investments.push({
          name,
          type: name.toLowerCase().includes("fund") ? "mutual_fund" : "stock",
          invested,
          current: invested, // Assume current = invested for generic CSV
          units: qty,
          nav,
          date: new Date().toISOString().split("T")[0],
          broker: "Unknown",
        })
      }
    }

    return {
      success: true,
      data: investments,
      broker: "Generic",
      fileType: "CSV",
    }
  } catch (error) {
    return {
      success: false,
      error: `Generic CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Excel Parser
export async function parseExcel(file: File): Promise<ParseResult> {
  try {
    // For Excel files, we'll need to use a library like xlsx
    // For now, let's try to read it as text and see if it's CSV-like
    const arrayBuffer = await file.arrayBuffer()
    const decoder = new TextDecoder("utf-8")
    const text = decoder.decode(arrayBuffer)

    // If it looks like CSV data, parse it as CSV
    if (text.includes(",") && text.includes("\n")) {
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
      return parseGenericCSV(lines)
    }

    return {
      success: false,
      error:
        "Excel file parsing requires additional libraries. Please convert to CSV format or use the manual entry option.",
    }
  } catch (error) {
    return {
      success: false,
      error: `Excel parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// PDF Parser
export async function parsePDF(file: File): Promise<ParseResult> {
  try {
    // PDF parsing is complex and requires libraries like pdf-parse
    // For now, we'll return a helpful error message
    return {
      success: false,
      error:
        "PDF parsing is not yet implemented. Please export your statement as CSV or Excel format, or use manual entry.",
    }
  } catch (error) {
    return {
      success: false,
      error: `PDF parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Main file parser function
export async function parseInvestmentFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase()
  const fileType = fileName.split(".").pop()

  console.log(`🔍 Parsing file: ${file.name} (${fileType})`)

  try {
    switch (fileType) {
      case "csv":
        return await parseCSV(file)
      case "xlsx":
      case "xls":
        return await parseExcel(file)
      case "pdf":
        return await parsePDF(file)
      default:
        return {
          success: false,
          error: `Unsupported file format: ${fileType}. Please use CSV, Excel, or PDF files.`,
        }
    }
  } catch (error) {
    console.error("File parsing error:", error)
    return {
      success: false,
      error: `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
