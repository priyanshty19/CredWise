"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { calculatePortfolioSummary } from "./utils/portfolio-utils"

interface PortfolioAnalysisProps {
  entries: any[]
}

const PortfolioAnalysis: React.FC<PortfolioAnalysisProps> = ({ entries }) => {
  const [summary, setSummary] = useState<any | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      const summaryData = await calculatePortfolioSummary(entries)
      setSummary(summaryData)
    }

    fetchSummary()
  }, [entries])

  return (
    <div>
      {summary ? (
        <div>
          <h2>Portfolio Summary</h2>
          <p>Total Value: {summary.totalValue}</p>
          <p>Profit/Loss: {summary.profitLoss}</p>
          {/* Additional summary details can be added here */}
        </div>
      ) : (
        <p>Loading summary...</p>
      )}
    </div>
  )
}

export default PortfolioAnalysis
