import Navigation from "@/components/navigation"
import EnhancedPersonalization from "@/components/enhanced-personalization"

export default function CardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="CARD RECOMMENDATIONS" />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Enhanced Card Recommendations</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience our advanced recommendation engine with dynamic filtering, real-time updates, and personalized
              insights.
            </p>
          </div>

          <EnhancedPersonalization />
        </div>
      </main>
    </div>
  )
}
