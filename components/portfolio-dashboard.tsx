"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { calculatePortfolioSummary } from "./utils/portfolio-utils"

const PortfolioDashboard: React.FC = () => {
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    const fetchEntries = async () => {
      // Simulate fetching entries from an API
      const response = await fetch("/api/portfolio-entries")
      const data = await response.json()
      setEntries(data)
    }

    fetchEntries()
  }, [])

  useEffect(() => {
    const updateSummary = async () => {
      const summaryData = await calculatePortfolioSummary(entries)
      setSummary(summaryData)
    }

    updateSummary()
  }, [entries])

  return (
    <div>
      <h1>Portfolio Dashboard</h1>
      {summary && (
        <div>
          <h2>Summary</h2>
          <p>Total Value: {summary.totalValue}</p>
          <p>Profit/Loss: {summary.profitLoss}</p>
        </div>
      )}
      {/* rest of code here */}
    </div>
  )
}

export default PortfolioDashboard
