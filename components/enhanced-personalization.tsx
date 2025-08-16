"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, CreditCard, Target, TrendingUp, Star } from "lucide-react"

interface PersonalizationProfile {
  demographics: {
    age: number
    occupation: string
    city: string
    creditScore: number
  }
  financials: {
    monthlyIncome: number
    monthlySpending: number
    existingCards: string[]
    creditUtilization: number
  }
  preferences: {
    rewardType: string
    spendingCategories: string[]
    bankPreferences: string[]
    feePreference: number
  }
  goals: {
    primaryGoal: string
    timeframe: string
    targetRewards: number
  }
}

export default function EnhancedPersonalization() {
  const [profile, setProfile] = useState<PersonalizationProfile>({
    demographics: {
      age: 30,
      occupation: "",
      city: "",
      creditScore: 750,
    },
    financials: {
      monthlyIncome: 50000,
      monthlySpending: 30000,
      existingCards: [],
      creditUtilization: 30,
    },
    preferences: {
      rewardType: "",
      spendingCategories: [],
      bankPreferences: [],
      feePreference: 2500,
    },
    goals: {
      primaryGoal: "",
      timeframe: "",
      targetRewards: 10000,
    },
  })

  const [activeTab, setActiveTab] = useState("demographics")

  const spendingCategories = [
    "Online Shopping",
    "Dining",
    "Travel",
    "Groceries",
    "Fuel",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
  ]

  const banks = [
    "HDFC Bank",
    "ICICI Bank",
    "SBI",
    "Axis Bank",
    "Kotak Mahindra",
    "IndusInd Bank",
    "Yes Bank",
    "Standard Chartered",
  ]

  const updateProfile = (section: keyof PersonalizationProfile, field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const toggleArrayItem = (section: keyof PersonalizationProfile, field: string, item: string) => {
    setProfile((prev) => {
      const currentArray = (prev[section] as any)[field] as string[]
      const newArray = currentArray.includes(item) ? currentArray.filter((i) => i !== item) : [...currentArray, item]

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray,
        },
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Enhanced Personalization</h1>
        <p className="text-lg text-gray-600">
          Create a detailed profile for highly personalized credit card recommendations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demographics" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Demographics
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Financials
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demographics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.demographics.age}
                    onChange={(e) => updateProfile("demographics", "age", Number.parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="creditScore">Credit Score</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[profile.demographics.creditScore]}
                      onValueChange={(value) => updateProfile("demographics", "creditScore", value[0])}
                      max={850}
                      min={300}
                      step={10}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{profile.demographics.creditScore}</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Select onValueChange={(value) => updateProfile("demographics", "occupation", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salaried">Salaried Employee</SelectItem>
                      <SelectItem value="business">Business Owner</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.demographics.city}
                    onChange={(e) => updateProfile("demographics", "city", e.target.value)}
                    placeholder="Enter your city"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Financial Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={profile.financials.monthlyIncome}
                    onChange={(e) => updateProfile("financials", "monthlyIncome", Number.parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="monthlySpending">Monthly Spending (₹)</Label>
                  <Input
                    id="monthlySpending"
                    type="number"
                    value={profile.financials.monthlySpending}
                    onChange={(e) => updateProfile("financials", "monthlySpending", Number.parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Credit Utilization (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[profile.financials.creditUtilization]}
                      onValueChange={(value) => updateProfile("financials", "creditUtilization", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{profile.financials.creditUtilization}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Preferences & Spending Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Reward Type Preference</Label>
                <Select onValueChange={(value) => updateProfile("preferences", "rewardType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reward type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="points">Reward Points</SelectItem>
                    <SelectItem value="miles">Air Miles</SelectItem>
                    <SelectItem value="mixed">Mixed Rewards</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Primary Spending Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {spendingCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={profile.preferences.spendingCategories.includes(category)}
                        onCheckedChange={() => toggleArrayItem("preferences", "spendingCategories", category)}
                      />
                      <Label htmlFor={category} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Banks</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {banks.map((bank) => (
                    <div key={bank} className="flex items-center space-x-2">
                      <Checkbox
                        id={bank}
                        checked={profile.preferences.bankPreferences.includes(bank)}
                        onCheckedChange={() => toggleArrayItem("preferences", "bankPreferences", bank)}
                      />
                      <Label htmlFor={bank} className="text-sm">
                        {bank}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Maximum Annual Fee (₹)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[profile.preferences.feePreference]}
                    onValueChange={(value) => updateProfile("preferences", "feePreference", value[0])}
                    max={10000}
                    min={0}
                    step={500}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">
                    ₹{profile.preferences.feePreference.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Financial Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Primary Goal</Label>
                <Select onValueChange={(value) => updateProfile("goals", "primaryGoal", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maximize-rewards">Maximize Rewards</SelectItem>
                    <SelectItem value="build-credit">Build Credit Score</SelectItem>
                    <SelectItem value="travel-benefits">Travel Benefits</SelectItem>
                    <SelectItem value="cashback">Cashback Optimization</SelectItem>
                    <SelectItem value="premium-lifestyle">Premium Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Timeframe</Label>
                <Select onValueChange={(value) => updateProfile("goals", "timeframe", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (0-3 months)</SelectItem>
                    <SelectItem value="short-term">Short-term (3-12 months)</SelectItem>
                    <SelectItem value="medium-term">Medium-term (1-3 years)</SelectItem>
                    <SelectItem value="long-term">Long-term (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Annual Rewards (₹)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[profile.goals.targetRewards]}
                    onValueChange={(value) => updateProfile("goals", "targetRewards", value[0])}
                    max={50000}
                    min={1000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">
                    ₹{profile.goals.targetRewards.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ₹{profile.financials.monthlyIncome.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Monthly Income</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{profile.demographics.creditScore}</div>
              <div className="text-sm text-green-700">Credit Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{profile.preferences.spendingCategories.length}</div>
              <div className="text-sm text-purple-700">Spending Categories</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                ₹{profile.preferences.feePreference.toLocaleString()}
              </div>
              <div className="text-sm text-orange-700">Max Annual Fee</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.preferences.spendingCategories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>

          <Button className="w-full mt-6" size="lg">
            Get Personalized Recommendations
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
