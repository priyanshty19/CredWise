import Navigation from "@/components/navigation"
import CardRecommendationForm from "@/components/card-recommendation-form"

export default function CardsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="CARD RECOMMENDATIONS" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Card Recommendations</h1>
          <p className="text-gray-600 text-lg">
            Find the perfect credit card based on your spending patterns and preferences
          </p>
        </div>

        <CardRecommendationForm />
      </main>
    </div>
  )
}
