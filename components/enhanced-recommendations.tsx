"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Gift, Shield, Zap, TrendingUp } from "lucide-react"

interface CardInfo {
  id: string
  name: string
  bank: string
  type: string
  annualFee: number
  joiningFee: number
  rewardRate: string
  welcomeBonus: string
  keyFeatures: string[]
  bestFor: string[]
  rating: number
  image?: string
}

const sampleCards: CardInfo[] = [
  {
    id: "1",
    name: "HDFC Regalia Gold",
    bank: "HDFC Bank",
    type: "Premium",
    annualFee: 2500,
    joiningFee: 2500,
    rewardRate: "4 points per ₹150",
    welcomeBonus: "10,000 bonus points",
    keyFeatures: ["Airport lounge access", "Dining privileges", "Fuel surcharge waiver", "Insurance coverage"],
    bestFor: ["Travel", "Dining", "Shopping"],
    rating: 4.5,
  },
  {
    id: "2",
    name: "SBI Cashback Card",
    bank: "State Bank of India",
    type: "Cashback",
    annualFee: 999,
    joiningFee: 999,
    rewardRate: "5% cashback online",
    welcomeBonus: "₹2,000 cashback",
    keyFeatures: [
      "5% cashback on online spends",
      "1% cashback on offline spends",
      "No cashback capping",
      "Fuel surcharge waiver",
    ],
    bestFor: ["Online Shopping", "Digital Payments"],
    rating: 4.3,
  },
  {
    id: "3",
    name: "ICICI Amazon Pay",
    bank: "ICICI Bank",
    type: "Co-branded",
    annualFee: 0,
    joiningFee: 0,
    rewardRate: "5% on Amazon",
    welcomeBonus: "₹1,000 Amazon voucher",
    keyFeatures: ["5% cashback on Amazon", "2% cashback on bill payments", "1% cashback on others", "No annual fee"],
    bestFor: ["Amazon Shopping", "Bill Payments"],
    rating: 4.2,
  },
]

export default function EnhancedRecommendations() {
  const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null)
  const [activeTab, setActiveTab] = useState("recommendations")

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Enhanced Credit Card Recommendations</h1>
        <p className="text-lg text-gray-600">
          Discover the perfect credit cards tailored to your lifestyle and spending patterns
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="comparison">Compare Cards</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleCards.map((card) => (
              <Card
                key={card.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCard(card)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <Badge variant="secondary">{card.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{card.bank}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{card.rating}/5</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Annual Fee:</span>
                      <span className="font-medium">₹{card.annualFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Reward Rate:</span>
                      <span className="font-medium">{card.rewardRate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Best For:</p>
                    <div className="flex flex-wrap gap-1">
                      {card.bestFor.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Card Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600">Select cards from recommendations to compare features side by side</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Spending Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Online Shopping</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                      <span className="text-sm">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dining</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                      <span className="text-sm">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Travel</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <span className="text-sm">45%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Reward Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800">Potential Savings</h4>
                    <p className="text-2xl font-bold text-green-600">₹12,500</p>
                    <p className="text-sm text-green-700">Annual rewards with recommended cards</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Top Recommendations:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Use SBI Cashback for online purchases</li>
                      <li>• HDFC Regalia for dining and travel</li>
                      <li>• ICICI Amazon Pay for Amazon shopping</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedCard.name}</CardTitle>
                  <p className="text-gray-600">{selectedCard.bank}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedCard(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Annual Fee</p>
                  <p className="text-lg font-semibold">₹{selectedCard.annualFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joining Fee</p>
                  <p className="text-lg font-semibold">₹{selectedCard.joiningFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reward Rate</p>
                  <p className="text-lg font-semibold">{selectedCard.rewardRate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Welcome Bonus</p>
                  <p className="text-lg font-semibold">{selectedCard.welcomeBonus}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {selectedCard.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Best For</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCard.bestFor.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1">Apply Now</Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Compare
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
