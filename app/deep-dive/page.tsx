import Navigation from '@/components/navigation'

export default function DeepDivePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="DEEP DIVE" />
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Deep Dive Analysis
        </h1>
        <p className="text-xl text-gray-600">
          Coming soon - Detailed financial analysis and insights
        </p>
      </main>
    </div>
  )
}
