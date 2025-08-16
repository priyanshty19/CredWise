import Navigation from "@/components/navigation"
import CardRecommendationForm from "@/components/card-recommendation-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="CARD RECOMMENDATIONS" />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Smart Credit Card Recommendations</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get personalized credit card recommendations based on your spending patterns, income, and financial goals.
              Our AI analyzes your profile to find the perfect cards for you.
            </p>
          </div>

          <CardRecommendationForm />
        </div>
      </main>
    </div>
  )
}
