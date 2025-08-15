import { Suspense } from "react"
import Navigation from "@/components/navigation"
import CardRecommendationForm from "@/components/card-recommendation-form"
import GoogleSheetsStatus from "@/components/google-sheets-status"

export default function CardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="CARD" />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Your Credit Card Recommendation</h1>
            <p className="text-gray-600 text-lg">
              Find the perfect credit card tailored to your financial profile using live data and intelligent filtering
            </p>
          </div>

          {/* Card Data Sheet Status */}
          <GoogleSheetsStatus />

          {/* COMMENTED OUT - Public Access Connection Test */}
          {/* <TestGoogleSheets /> */}

          {/* COMMENTED OUT - Apps Script Debugger - only show if there's an issue */}
          {/* <AppsScriptDebugger /> */}

          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
            <CardRecommendationForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
