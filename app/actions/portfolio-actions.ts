"use server"

import { parseCSV, parseXLSX, parsePDF } from "@/lib/file-parsers"
import { parseUniversalStatement } from "@/lib/universal-statement-parser"

export async function uploadPortfolioFile(formData: FormData) {
  const file = formData.get("file") as File

  if (!file) {
    return { success: false, error: "No file provided" }
  }

  try {
    let data: any[] = []

    if (file.type === "text/csv") {
      data = await parseCSV(file)
    } else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      data = await parseXLSX(file)
    } else if (file.type === "application/pdf") {
      data = await parsePDF(file)
    } else {
      return { success: false, error: "Unsupported file type" }
    }

    // Parse the data using universal parser
    const parsedData = parseUniversalStatement(data, file.name)

    return {
      success: true,
      data: parsedData,
      fileName: file.name,
      fileType: file.type,
    }
  } catch (error) {
    console.error("Error processing file:", error)
    return { success: false, error: "Failed to process file" }
  }
}

export async function addManualEntry(formData: FormData) {
  const category = formData.get("category") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const description = formData.get("description") as string
  const date = formData.get("date") as string

  if (!category || !amount || !description || !date) {
    return { success: false, error: "All fields are required" }
  }

  try {
    const entry = {
      id: Date.now().toString(),
      category,
      amount,
      description,
      date,
      type: "manual",
    }

    return {
      success: true,
      data: entry,
    }
  } catch (error) {
    console.error("Error adding manual entry:", error)
    return { success: false, error: "Failed to add entry" }
  }
}

export async function removePortfolioFile(fileName: string) {
  try {
    // In a real app, you'd remove from database/storage
    return {
      success: true,
      message: `Removed ${fileName}`,
    }
  } catch (error) {
    console.error("Error removing file:", error)
    return { success: false, error: "Failed to remove file" }
  }
}
