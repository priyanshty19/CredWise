// lib/google-sheets.ts

import { GoogleSpreadsheet } from "google-spreadsheet"
import type { CardType } from "./types"

const doc = new GoogleSpreadsheet("YOUR_SPREADSHEET_ID")

async function loadCardsFromGoogleSheets() {
  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]
  await sheet.loadCells()

  const headerRow = sheet.headerValues
  const requiredHeaders = ["id", "name", "type", "description"]
  const missingHeaders = requiredHeaders.filter((header) => !headerRow.includes(header))

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`)
  }

  const rows = await sheet.getRows()
  const validCards: CardType[] = []
  let skippedRows = 0

  for (const row of rows) {
    const cardType = normalizeCardType(row.type)
    if (cardType) {
      validCards.push({
        id: row.id,
        name: row.name,
        type: cardType,
        description: row.description,
      })
    } else {
      skippedRows++
    }
  }

  console.log(`📊 Loaded ${validCards.length} cards from Google Sheets (${skippedRows} skipped)`)
}

function normalizeCardType(type: string): CardType | null {
  const normalizedType = type.toLowerCase()
  switch (normalizedType) {
    case "feature":
      return "feature"
    case "bug":
      return "bug"
    case "task":
      return "task"
    default:
      return null
  }
}

// ** rest of code here **
