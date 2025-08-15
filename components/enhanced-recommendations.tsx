"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, TrendingUp, Shield, Star, ExternalLink, CheckCircle, Info, Zap } from 'lucide-react'

interface Recommendation {
  cardName: string
  bank: string
  features: string[]
  reason: string
  rating: number
  annualFee?: string
  welcomeBonus?: string
  category?: string
}

interface EnhancedRecommendationsProps {
  recommendations: Recommendation[]
  userProfile: {
    creditScore: number
    annualIncome: number
    cardType: string
  }
}

export default function EnhancedRecommendations({ 
  recommendations, 
  userProfile 
}: EnhancedRecommendationsProps) {
  
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Premium': 'bg-purple-100 text-purple-800',
      'Travel': 'bg-blue-100 text-blue-800',
      'Cashback': 'bg-green-100 text-green-800',
      'Business': 'bg-orange-100 text-orange-800',
      'Starter': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getApprovalProbability = (creditScore: number) => {
    if (creditScore >= 750) return { text: 'Very High', color: 'text-green-600', percentage: '90-95%' }
    if (creditScore >= 700) return { text: 'High', color: 'text-blue-600', percentage: '75-85%' }
    if (creditScore >= 650) return { text: 'Good', color: 'text-yellow-600', percentage: '60-75%' }
    return { text: 'Fair', color: 'text-orange-600', percentage: '40-60%' }
  }

  const approval = getApprovalProbability(userProfile.creditScore)

  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Your Profile:</strong> Credit Score: {userProfile.creditScore} | 
          Annual Income: ₹{(userProfile.annualIncome / 100000).toFixed(1)}L | 
          Preference: {userProfile.cardType} | 
          Approval Probability: <span className={approval.color}>{approval.text} ({approval.percentage})</span>
        </AlertDescription>
      </Alert>

      {/* Recommendations Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Zap className="mr-2 h-6 w-6 text-yellow-500" />
          Your Personalized Recommendations
        </h2>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {recommendations.length} matches found
        </Badge>
      </div>

      {/* Recommendation Cards */}
      <div className="grid gap-6">
        {recommendations.map((rec, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{rec.cardName}</h3>
                    {index === 0 && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        TOP PICK
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 font-medium">{rec.bank}</p>
                  {rec.category && (
                    <Badge className={`mt-1 text-xs ${getCategoryColor(rec.category)}`}>
                      {rec.category}
                    </Badge>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rec.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{rec.rating}/5</span>
                  </div>
                  {rec.annualFee && (
                    <p className="text-xs text-gray-500">Fee: {rec.annualFee}</p>
                  )}
                </div>
              </div>

              {/* Welcome Bonus */}
              {rec.welcomeBonus && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Welcome Bonus: {rec.welcomeBonus}
                    </span>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-blue-600" />
                  Key Features:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rec.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation Reason */}
              <Alert className="bg-blue-50 border-blue-200 mb-4">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Why this card?</strong> {rec.reason}
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Apply Now
                </Button>
                <Button variant="outline" className="flex-1">
                  Compare Details
                </Button>
                <Button variant="ghost" className="flex-1">
                  Save for Later
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Tips */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Pro Tips for Your Application:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Apply for only one card at a time to avoid multiple credit inquiries</li>
            <li>• Ensure your credit report is accurate before applying</li>
            <li>• Consider your spending patterns when choosing between cashback and rewards</li>
            <li>• Read the terms and conditions carefully, especially regarding fees and interest rates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
