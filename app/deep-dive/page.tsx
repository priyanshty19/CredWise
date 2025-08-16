import Navigation from "@/components/navigation"
import DeepDiveSection from "@/components/deep-dive-section"

export default function DeepDivePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="DEEP DIVE" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deep Dive Financial Analysis</h1>
          <p className="text-gray-600 text-lg">
            Comprehensive financial portfolio analysis, goal planning, and fund management tools
          </p>
        </div>

        {/** rest of code here **/}
        <DeepDiveSection />
      </main>
    </div>
  )
}
