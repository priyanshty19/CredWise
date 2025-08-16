import * as XLSX from "xlsx"

export interface ParsedPortfolioEntry {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "bond" | "etf"
  units: number
  nav: number
  invested: number
  current: number
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
  totalParsed: number
  broker?: string
  detectedTableRange?: string
  sheetName?: string
}

// Enhanced Groww headers mapping
const GROWW_HEADERS = {
  // Mutual Fund headers
  SCHEME_NAME: ["scheme name", "fund name", "scheme", "fund", "investment name", "name"],
  AMC: ["amc", "fund house", "asset management company", "mutual fund"],
  CATEGORY: ["category", "type", "fund type", "asset type"],
  SUB_CATEGORY: ["sub-category", "sub category", "subcategory", "sub-type"],
  FOLIO: ["folio", "folio number", "folio no", "portfolio number"],
  UNITS: ["units", "quantity", "shares", "no of units", "number of units"],
  NAV: ["nav", "price", "unit price", "net asset value", "current nav"],
  INVESTED_VALUE: ["invested value", "invested amount", "cost", "purchase value", "invested"],
  CURRENT_VALUE: ["current value", "market value", "present value", "current amount"],
  GAIN_LOSS: ["gain/loss", "gain loss", "p&l", "profit loss", "returns"],
  GAIN_LOSS_PERCENT: ["gain/loss %", "gain loss %", "returns %", "p&l %"],

  // Stock headers
  SYMBOL: ["symbol", "stock symbol", "scrip", "ticker"],
  COMPANY_NAME: ["company name", "company", "stock name"],
  ISIN: ["isin", "isin code"],
  EXCHANGE: ["exchange", "market"],
  SECTOR: ["sector", "industry"],

  // Common headers
  DATE: ["date", "purchase date", "investment date", "transaction date"],
  REMARKS: ["remarks", "notes", "comments"],
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
}

function findHeaderMatch(header: string, possibleHeaders: string[]): boolean {
  const normalized = normalizeHeader(header)
  return possibleHeaders.some((possible) => normalized.includes(possible) || possible.includes(normalized))
}

function isValidEntry(entry: any): boolean {
  // Check if this looks like a data row, not a header or total
  const name = String(entry.name || "")
    .toLowerCase()
    .trim()

  // Skip empty names
  if (!name) return false

  // Skip common non-data rows
  const skipPatterns = [
    "total",
    "grand total",
    "sum",
    "subtotal",
    "scheme name",
    "fund name",
    "company name",
    "header",
    "title",
    "category",
    "type",
  ]

  if (skipPatterns.some((pattern) => name.includes(pattern))) {
    return false
  }

  // Must have positive units and values
  const units = Number(entry.units) || 0
  const invested = Number(entry.invested) || 0
  const current = Number(entry.current) || 0

  return units > 0 && invested > 0 && current >= 0
}

function detectTableRange(worksheet: XLSX.WorkSheet): { range: string; startRow: number; endRow: number } | null {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1")
  let headerRow = -1
  let dataStartRow = -1
  let dataEndRow = -1

  // Look for header row containing key identifiers
  for (let row = range.s.r; row <= Math.min(range.e.r, range.s.r + 50); row++) {
    let headerCount = 0
    let hasKeyHeaders = false

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = worksheet[cellAddress]

      if (cell && cell.v) {
        const cellValue = String(cell.v).toLowerCase().trim()
        headerCount++

        // Check for key Groww headers
        if (
          findHeaderMatch(cellValue, GROWW_HEADERS.SCHEME_NAME) ||
          findHeaderMatch(cellValue, GROWW_HEADERS.UNITS) ||
          findHeaderMatch(cellValue, GROWW_HEADERS.NAV) ||
          findHeaderMatch(cellValue, GROWW_HEADERS.CURRENT_VALUE)
        ) {
          hasKeyHeaders = true
        }
      }
    }

    // Found header row if it has multiple columns and key headers
    if (headerCount >= 3 && hasKeyHeaders) {
      headerRow = row
      dataStartRow = row + 1
      break
    }
  }

  if (headerRow === -1) return null

  // Find end of data
  for (let row = dataStartRow; row <= range.e.r; row++) {
    let hasData = false

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = worksheet[cellAddress]

      if (cell && cell.v && String(cell.v).trim()) {
        hasData = true
        break
      }
    }

    if (hasData) {
      dataEndRow = row
    } else if (dataEndRow > 0 && row - dataEndRow > 5) {
      // Stop if we've had 5+ empty rows after data
      break
    }
  }

  if (dataEndRow === -1) dataEndRow = range.e.r

  const tableRange = `${XLSX.utils.encode_cell({ r: headerRow, c: range.s.c })}:${XLSX.utils.encode_cell({ r: dataEndRow, c: range.e.c })}`

  return {
    range: tableRange,
    startRow: headerRow,
    endRow: dataEndRow,
  }
}

function parseGrowwExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        const allEntries: ParsedPortfolioEntry[] = []
        const errors: string[] = []
        const detectedBroker = "Groww"
        let bestSheetName = ""
        let bestTableRange = ""

        // Process each sheet
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]

          // Detect table range
          const tableInfo = detectTableRange(worksheet)
          if (!tableInfo) {
            continue
          }

          // Convert to JSON with detected range
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            range: tableInfo.range,
            header: 1,
            defval: "",
          }) as any[][]

          if (jsonData.length < 2) continue

          const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim())
          const dataRows = jsonData.slice(1)

          // Map headers to our standard format
          const headerMap: { [key: string]: number } = {}

          headers.forEach((header, index) => {
            if (findHeaderMatch(header, GROWW_HEADERS.SCHEME_NAME)) {
              headerMap.name = index
            } else if (findHeaderMatch(header, GROWW_HEADERS.UNITS)) {
              headerMap.units = index
            } else if (findHeaderMatch(header, GROWW_HEADERS.NAV)) {
              headerMap.nav = index
            } else if (findHeaderMatch(header, GROWW_HEADERS.INVESTED_VALUE)) {
              headerMap.invested = index
            } else if (findHeaderMatch(header, GROWW_HEADERS.CURRENT_VALUE)) {
              headerMap.current = index
            } else if (findHeaderMatch(header, GROWW_HEADERS.FOLIO)) {
              headerMap.folio = index
            } else if (findHeaderMatch(header, GROWW_HEADERS.AMC)) {
              headerMap.amc = index
            } else if (findHeaderMatch(header, GROWW_HEADERS.CATEGORY)) {
              headerMap.category = index
            }
          })

          // Must have essential columns
          if (!headerMap.hasOwnProperty("name") || !headerMap.hasOwnProperty("units")) {
            continue
          }

          // Process data rows
          const sheetEntries: ParsedPortfolioEntry[] = []

          dataRows.forEach((row, rowIndex) => {
            try {
              const name = String(row[headerMap.name] || "").trim()
              const units = Number(row[headerMap.units]) || 0
              const nav = Number(row[headerMap.nav]) || 0
              const invested = Number(row[headerMap.invested]) || 0
              const current = Number(row[headerMap.current]) || 0

              // Create entry object for validation
              const entryForValidation = {
                name,
                units,
                invested: invested || units * nav,
                current: current || units * nav,
              }

              if (!isValidEntry(entryForValidation)) {
                return
              }

              const entry: ParsedPortfolioEntry = {
                id: `groww-${Date.now()}-${rowIndex}`,
                name,
                type: "mutual_fund",
                units,
                nav: nav || invested / units || 0,
                invested: invested || units * nav,
                current: current || units * nav,
                date: new Date().toISOString().split("T")[0],
                source: "upload",
                fileName: file.name,
                broker: detectedBroker,
                folio: headerMap.folio !== undefined ? String(row[headerMap.folio] || "") : undefined,
              }

              // Final validation
              if (entry.units > 0 && entry.invested > 0) {
                sheetEntries.push(entry)
              }
            } catch (error) {
              errors.push(`Row ${rowIndex + 2}: ${error instanceof Error ? error.message : "Parse error"}`)
            }
          })

          if (sheetEntries.length > 0) {
            allEntries.push(...sheetEntries)
            bestSheetName = sheetName
            bestTableRange = tableInfo.range
          }
        }

        resolve({
          success: allEntries.length > 0,
          data: allEntries,
          errors,
          totalParsed: allEntries.length,
          broker: detectedBroker,
          detectedTableRange: bestTableRange,
          sheetName: bestSheetName,
        })
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [error instanceof Error ? error.message : "Unknown Excel parsing error"],
          totalParsed: 0,
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ["Failed to read Excel file"],
        totalParsed: 0,
      })
    }

    reader.readAsArrayBuffer(file)
  })
}

function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line)

        if (lines.length < 2) {
          resolve({
            success: false,
            data: [],
            errors: ["CSV file appears to be empty or has no data rows"],
            totalParsed: 0,
          })
          return
        }

        // Detect delimiter
        const firstLine = lines[0]
        const delimiter = firstLine.includes("\t") ? "\t" : firstLine.includes(";") ? ";" : ","

        const headers = lines[0].split(delimiter).map((h) => h.replace(/"/g, "").trim().toLowerCase())
        const dataRows = lines.slice(1)

        // Map headers
        const headerMap: { [key: string]: number } = {}

        headers.forEach((header, index) => {
          if (findHeaderMatch(header, GROWW_HEADERS.SCHEME_NAME)) {
            headerMap.name = index
          } else if (findHeaderMatch(header, GROWW_HEADERS.UNITS)) {
            headerMap.units = index
          } else if (findHeaderMatch(header, GROWW_HEADERS.NAV)) {
            headerMap.nav = index
          } else if (findHeaderMatch(header, GROWW_HEADERS.INVESTED_VALUE)) {
            headerMap.invested = index
          } else if (findHeaderMatch(header, GROWW_HEADERS.CURRENT_VALUE)) {
            headerMap.current = index
          }
        })

        if (!headerMap.hasOwnProperty("name")) {
          resolve({
            success: false,
            data: [],
            errors: ["Could not find scheme/fund name column in CSV"],
            totalParsed: 0,
          })
          return
        }

        const entries: ParsedPortfolioEntry[] = []
        const errors: string[] = []

        dataRows.forEach((line, index) => {
          try {
            const values = line.split(delimiter).map((v) => v.replace(/"/g, "").trim())

            const name = values[headerMap.name] || ""
            const units = Number(values[headerMap.units]) || 0
            const nav = Number(values[headerMap.nav]) || 0
            const invested = Number(values[headerMap.invested]) || 0
            const current = Number(values[headerMap.current]) || 0

            const entryForValidation = {
              name,
              units,
              invested: invested || units * nav,
              current: current || units * nav,
            }

            if (!isValidEntry(entryForValidation)) {
              return
            }

            const entry: ParsedPortfolioEntry = {
              id: `csv-${Date.now()}-${index}`,
              name,
              type: "mutual_fund",
              units,
              nav: nav || invested / units || 0,
              invested: invested || units * nav,
              current: current || units * nav,
              date: new Date().toISOString().split("T")[0],
              source: "upload",
              fileName: file.name,
              broker: "CSV Import",
            }

            if (entry.units > 0 && entry.invested > 0) {
              entries.push(entry)
            }
          } catch (error) {
            errors.push(`Line ${index + 2}: ${error instanceof Error ? error.message : "Parse error"}`)
          }
        })

        resolve({
          success: entries.length > 0,
          data: entries,
          errors,
          totalParsed: entries.length,
          broker: "CSV Import",
        })
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [error instanceof Error ? error.message : "CSV parsing error"],
          totalParsed: 0,
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ["Failed to read CSV file"],
        totalParsed: 0,
      })
    }

    reader.readAsText(file)
  })
}

export async function parsePortfolioFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    return parseGrowwExcel(file)
  } else if (fileName.endsWith(".csv")) {
    return parseCSV(file)
  } else {
    return {
      success: false,
      data: [],
      errors: ["Unsupported file format. Please upload CSV or Excel files."],
      totalParsed: 0,
    }
  }
}
