# CredWise - Business Requirements Document (BRD)
## Credit Card Recommendation System

**Version:** 2.0  
**Last Updated:** January 2025  
**Document Owner:** Product Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Data Model](#data-model)
4. [Recommendation Algorithms](#recommendation-algorithms)
5. [Filtering Logic](#filtering-logic)
6. [Scoring Mechanisms](#scoring-mechanisms)
7. [User Journey](#user-journey)
8. [Integration Architecture](#integration-architecture)
9. [Analytics & Tracking](#analytics--tracking)
10. [Success Criteria](#success-criteria)

---

## 1. Executive Summary

CredWise is an intelligent credit card recommendation platform that matches users with optimal credit cards based on their financial profile, spending patterns, and preferences. The system implements multiple sophisticated algorithms to ensure highly personalized recommendations.

### Key Features
- **Multi-Algorithm Approach**: 3 distinct recommendation engines
- **Funnel-Based Filtering**: 3-level eligibility screening
- **Two-Tier Recommendation System**: Preferred brand prioritization
- **Real-Time Processing**: Live data from Google Sheets
- **Portfolio Analysis**: Deep dive into existing card holdings
- **Comprehensive Analytics**: Full submission and click tracking

---

## 2. System Overview

### 2.1 Architecture Components

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  - Card Recommendation Form                                  │
│  - Enhanced Personalization                                  │
│  - Deep Dive Section                                         │
│  - Portfolio Analysis                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  - Funnel Recommendation Engine                             │
│  - Adaptive Intersection Algorithm                          │
│  - Refined Scoring Algorithm                                │
│  - Portfolio Parser                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  - Google Sheets API (Credit Card Database)                 │
│  - Google Apps Script (Form Submissions)                    │
│  - Server Actions (Secure Data Fetching)                    │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### 2.2 Technology Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: Google Sheets (via Google Sheets API v4)
- **Submission Tracking**: Google Apps Script
- **Deployment**: Vercel

---

## 3. Data Model

### 3.1 Credit Card Entity

\`\`\`typescript
interface CreditCard {
  id: string                          // Unique identifier
  cardName: string                    // Card display name
  bank: string                        // Issuing bank/brand
  cardType: string                    // Category (Cashback, Travel, Rewards, etc.)
  joiningFee: number                  // One-time joining fee (₹)
  annualFee: number                   // Yearly maintenance fee (₹)
  creditScoreRequirement: number      // Minimum credit score (300-850)
  monthlyIncomeRequirement: number    // Minimum monthly income (₹)
  rewardsRate: number                 // Cashback/rewards percentage
  signUpBonus: number                 // Welcome bonus amount (₹)
  features: string[]                  // Key features array
  description: string                 // Card description
  spendingCategories: string[]        // Applicable spending categories
}
\`\`\`

### 3.2 User Profile Entity

\`\`\`typescript
interface UserProfile {
  monthlyIncome: number               // User's monthly income (₹)
  creditScore: number                 // Credit score (300-850)
  spendingCategories: string[]        // Primary spending categories
  joiningFeePreference: string        // Fee preference (no_fee | low_fee | no_concern)
  preferredBrands: string[]           // Preferred card brands (max 3)
  monthlySpending?: number            // Optional: Monthly spending amount
  currentCards?: string               // Optional: Number of existing cards
}
\`\`\`

### 3.3 Recommendation Output

\`\`\`typescript
interface Recommendation {
  name: string                        // Card name
  bank: string                        // Issuing bank
  type: string                        // Card category
  annualFee: number                   // Annual fee
  joiningFee: number                  // Joining fee
  rewardRate: string                  // Reward rate display
  welcomeBonus: string                // Welcome bonus display
  keyFeatures: string[]               // Key features
  bestFor: string[]                   // Best suited categories
  score: number                       // Overall score (0-100)
  reasoning: string                   // Recommendation reasoning
  scoreBreakdown: {                   // Detailed scoring
    categoryMatch: number
    rewardsRate: number
    brandMatch?: number
    signUpBonus?: number
  }
  matchPercentage: number             // Category match percentage
  rank: number                        // Ranking position
  tier: string                        // Tier (preferred_brand | general)
}
\`\`\`

---

## 4. Recommendation Algorithms

The CredWise system implements **three distinct recommendation algorithms**, each optimized for different use cases:

### 4.1 Algorithm 1: Funnel-Based Recommendation Engine (Primary)

**Purpose**: Multi-stage filtering with preferred brand prioritization

#### Overview
The Funnel-Based Engine implements a rigorous 3-level filtering system followed by a two-tier recommendation approach to ensure only the most relevant cards reach the user.

#### Implementation Flow

\`\`\`
                    ┌─────────────────────┐
                    │   All Cards (DB)    │
                    │     (N cards)       │
                    └──────────┬──────────┘
                               ↓
              ╔════════════════════════════════╗
              ║   LEVEL 1: Basic Eligibility   ║
              ║   - Income Check               ║
              ║   - Credit Score Check         ║
              ╚════════════════╦═══════════════╝
                               ↓
                    ┌─────────────────────┐
                    │  Eligible Cards     │
                    │  (Level 1 Pass)     │
                    └──────────┬──────────┘
                               ↓
              ╔════════════════════════════════╗
              ║  LEVEL 2: Category Matching    ║
              ║  - Spending Category Match     ║
              ║  - Threshold: >65% match       ║
              ╚════════════════╦═══════════════╝
                               ↓
                    ┌─────────────────────┐
                    │  Category-Matched   │
                    │  Cards (Level 2)    │
                    └──────────┬──────────┘
                               ↓
              ╔════════════════════════════════╗
              ║  LEVEL 3: Joining Fee Filter   ║
              ║  - Apply fee preference        ║
              ║  - Extract available brands    ║
              ╚════════════════╦═══════════════╝
                               ↓
                    ┌─────────────────────┐
                    │  Filtered Cards     │
                    │  (Level 3 Pass)     │
                    └──────────┬──────────┘
                               ↓
              ╔════════════════════════════════╗
              ║   TWO-TIER RECOMMENDATION      ║
              ║                                ║
              ║  TIER 1: Preferred Brands      ║
              ║  - Filter by user brands       ║
              ║  - Score & rank (max 7)        ║
              ║                                ║
              ║  TIER 2: General Cards         ║
              ║  - Fill remaining slots        ║
              ║  - Score & rank (up to 7)      ║
              ╚════════════════╦═══════════════╝
                               ↓
                    ┌─────────────────────┐
                    │   TOP 7 CARDS       │
                    │   (Final Output)    │
                    └─────────────────────┘
\`\`\`

#### Level 1: Basic Eligibility

**Logic**:
\`\`\`typescript
function level1BasicEligibility(cards, userIncome, userCreditScore) {
  return cards.filter(card => {
    const meetsIncome = card.monthlyIncomeRequirement === 0 || 
                        userIncome >= card.monthlyIncomeRequirement
    
    const meetsCredit = card.creditScoreRequirement === 0 || 
                        userCreditScore >= card.creditScoreRequirement
    
    return meetsIncome && meetsCredit
  })
}
\`\`\`

**Criteria**:
- ✅ User income ≥ card's minimum income requirement
- ✅ User credit score ≥ card's minimum credit score
- ✅ Hard eligibility criteria (no exceptions)

**Example**:
- User: ₹50,000/month, Credit Score: 700
- Card A: Requires ₹40,000/month, 650 score → ✅ PASS
- Card B: Requires ₹60,000/month, 650 score → ❌ FAIL (income)
- Card C: Requires ₹40,000/month, 750 score → ❌ FAIL (credit score)

#### Level 2: Category Matching

**Logic**:
\`\`\`typescript
function level2CategoryFiltering(level1Cards, userCategories) {
  if (userCategories.length === 0) return level1Cards
  
  return level1Cards.filter(card => {
    const matchPercentage = calculateCategoryMatchPercentage(
      userCategories, 
      card.spendingCategories
    )
    return matchPercentage > 65  // 65% threshold
  })
}
\`\`\`

**Criteria**:
- ✅ Card must match >65% of user's spending categories
- ✅ Flexible matching (exact, partial, keyword synonyms)
- ✅ If no categories selected, all cards pass

**Category Matching Algorithm**:

1. **Exact Match**: "Dining" = "Dining"
2. **Partial Match**: "Dining" includes "Dine" or vice versa
3. **Keyword Synonyms**:
   - Dining ↔ Restaurant, Food, Eat, Meal
   - Travel ↔ Hotel, Flight, Airline, Booking
   - Fuel ↔ Gas, Petrol, Gasoline, Pump
   - Shopping ↔ Retail, Store, Purchase, Buy

**Example**:
- User Categories: ["Dining", "Travel", "Shopping"] (3 categories)
- Card Categories: ["Dining", "Hotel", "Online Shopping"]
- Matches: Dining (exact), Hotel (synonym: Travel), Online Shopping (partial: Shopping)
- Match Count: 3/3 = 100% → ✅ PASS

#### Level 3: Joining Fee Filtering

**Logic**:
\`\`\`typescript
function level3JoiningFeeFiltering(level2Cards, feePreference) {
  let filtered = []
  
  switch (feePreference) {
    case "no_fee":
      filtered = level2Cards.filter(card => card.joiningFee === 0)
      break
    case "low_fee":
      filtered = level2Cards.filter(card => card.joiningFee <= 1000)
      break
    case "no_concern":
      filtered = level2Cards  // No filtering
      break
  }
  
  return filtered
}
\`\`\`

**Criteria**:
- **no_fee**: Only cards with ₹0 joining fee
- **low_fee**: Cards with joining fee ≤ ₹1,000
- **no_concern**: All cards pass (no filtering)

#### Two-Tier Recommendation System

**Purpose**: Prioritize user's preferred brands while ensuring 7 quality recommendations

**Logic**:
\`\`\`typescript
function twoTierRecommendationSystem(level3Cards, userProfile) {
  let preferredBrandCards = []
  let generalCards = []
  
  // TIER 1: Preferred Brand Cards
  if (userProfile.preferredBrands.length > 0) {
    const brandMatched = level3Cards.filter(card => 
      userProfile.preferredBrands.includes(card.bank)
    )
    preferredBrandCards = scoreAndSort(brandMatched, "preferred_brand")
                          .slice(0, 7)  // Max 7
  }
  
  // TIER 2: General Cards (if needed)
  if (preferredBrandCards.length < 7) {
    const remaining = 7 - preferredBrandCards.length
    const generalCandidates = level3Cards.filter(card => 
      !preferredBrandCards.some(pref => pref.card.id === card.id)
    )
    generalCards = scoreAndSort(generalCandidates, "general")
                   .slice(0, remaining)
  }
  
  // Combine and enforce 7-card limit
  return [...preferredBrandCards, ...generalCards].slice(0, 7)
}
\`\`\`

**Two-Tier Scenarios**:

| Scenario | Preferred Cards | General Cards | Total | Message |
|----------|----------------|---------------|-------|---------|
| Sufficient preferred | 7 | 0 | 7 | Show only preferred brand cards |
| Partial preferred | 3 | 4 | 7 | Show message: "Additional cards added to complete TOP 7" |
| No preferred | 0 | 7 | 7 | Show only general recommendations |
| Insufficient total | 2 | 3 | 5 | Show all available cards |

**Key Features**:
- ✅ Always prioritizes user's preferred brands
- ✅ Fills remaining slots with best alternatives
- ✅ Enforces strict 7-card maximum
- ✅ No duplicate cards across tiers
- ✅ Transparent messaging about recommendation mix

### 4.2 Algorithm 2: Adaptive Intersection-Based Algorithm

**Purpose**: Category-focused recommendations with intersection analysis

#### Overview
This algorithm prioritizes cards based on the intersection (overlap) between user's spending categories and card's supported categories, with additional scoring factors.

#### Scoring Weights

| Component | Weight | Purpose |
|-----------|--------|---------|
| Category Match | 40% | Highest priority - spending alignment |
| Rewards Rate | 25% | Second priority - cashback/rewards |
| Bank Preference | 15% | Bonus for preferred brands |
| Sign-up Bonus | 10% | Welcome offer value |
| Joining Fee | 5% | Lower fee preferred |
| Annual Fee | 5% | Lower fee preferred |
| **Total** | **100%** | - |

#### Scoring Logic

\`\`\`typescript
function calculateAdaptiveScore(card, userProfile) {
  // 1. Category Intersection (0-40 points)
  const intersection = calculateIntersection(
    userProfile.spendingCategories,
    card.spendingCategories
  )
  const categoryScore = (intersection.count / userProfile.categories.length) * 40

  // 2. Rewards Rate (0-25 points) - Normalized
  const rewardsScore = (card.rewardsRate / maxRewardsRate) * 25

  // 3. Bank Preference Bonus (0-15 points)
  const bankBonus = userProfile.preferredBanks.includes(card.bank) ? 15 : 0

  // 4. Sign-up Bonus (0-10 points) - Normalized
  const signupScore = (card.signUpBonus / maxSignUpBonus) * 10

  // 5. Joining Fee (0-5 points) - Lower is better
  const joiningScore = ((maxJoiningFee - card.joiningFee) / maxJoiningFee) * 5

  // 6. Annual Fee (0-5 points) - Lower is better
  const annualScore = ((maxAnnualFee - card.annualFee) / maxAnnualFee) * 5

  return categoryScore + rewardsScore + bankBonus + 
         signupScore + joiningScore + annualScore
}
\`\`\`

#### Example Calculation

**User Profile**:
- Categories: ["Dining", "Travel", "Shopping"]
- Preferred Banks: ["HDFC"]
- Income: ₹50,000
- Credit Score: 720

**Card: HDFC Regalia**:
- Categories: ["Dining", "Hotel", "Airport Lounge"]
- Rewards: 4%
- Sign-up: ₹10,000
- Joining: ₹2,500
- Annual: ₹2,500

**Score Calculation**:

1. **Category Match** (40 points max):
   - User: ["Dining", "Travel", "Shopping"]
   - Card: ["Dining", "Hotel", "Airport Lounge"]
   - Matches: Dining (exact), Hotel (synonym: Travel) = 2/3
   - Score: (2/3) × 40 = **26.7 points**

2. **Rewards Rate** (25 points max):
   - Card: 4%, Max in DB: 5%
   - Score: (4/5) × 25 = **20.0 points**

3. **Bank Bonus** (15 points max):
   - User prefers HDFC, Card is HDFC
   - Score: **15.0 points**

4. **Sign-up Bonus** (10 points max):
   - Card: ₹10,000, Max in DB: ₹15,000
   - Score: (10000/15000) × 10 = **6.7 points**

5. **Joining Fee** (5 points max):
   - Card: ₹2,500, Max in DB: ₹5,000
   - Score: ((5000-2500)/5000) × 5 = **2.5 points**

6. **Annual Fee** (5 points max):
   - Card: ₹2,500, Max in DB: ₹5,000
   - Score: ((5000-2500)/5000) × 5 = **2.5 points**

**Total Score**: 26.7 + 20.0 + 15.0 + 6.7 + 2.5 + 2.5 = **73.4 / 100**

#### Ranking & Selection

1. Calculate scores for all eligible cards
2. Filter cards with category intersection > 0
3. Sort by total score (descending)
4. Select top 7 cards

### 4.3 Algorithm 3: Refined Scoring Algorithm

**Purpose**: Simplified scoring for card tester and quick recommendations

#### Scoring Components

| Component | Weight | Calculation |
|-----------|--------|-------------|
| Rewards Rate | 30% | (rate / maxRate) × 30 |
| Category Match | 30% | (matches / userCategories) × 30 |
| Sign-up Bonus | 20% | (bonus / maxBonus) × 20 |
| Joining Fee | 10% | ((max - fee) / max) × 10 |
| Annual Fee | 10% | ((max - fee) / max) × 10 |
| Bank Bonus | +5 | Flat bonus if preferred bank |
| **Total** | **105%** | Max 105 with bank bonus |

#### Implementation

\`\`\`typescript
function calculateRefinedScore(card, userCategories, preferredBanks, maxValues) {
  // 1. Rewards Rate (0-30)
  const rewardsScore = (card.rewardsRate / maxValues.rewards) * 30

  // 2. Category Match (0-30)
  const matches = card.spendingCategories.filter(cat => 
    userCategories.includes(cat)
  )
  const categoryScore = userCategories.length > 0
    ? (matches.length / userCategories.length) * 30
    : 0

  // 3. Sign-up Bonus (0-20)
  const signupScore = (card.signUpBonus / maxValues.signup) * 20

  // 4. Joining Fee (0-10) - Lower is better
  const joiningScore = ((maxValues.joining - card.joiningFee) / maxValues.joining) * 10

  // 5. Annual Fee (0-10) - Lower is better
  const annualScore = ((maxValues.annual - card.annualFee) / maxValues.annual) * 10

  // 6. Bank Bonus (0-5)
  const bankScore = preferredBanks.some(bank => 
    card.bank.toLowerCase().includes(bank.toLowerCase())
  ) ? 5 : 0

  return rewardsScore + categoryScore + signupScore + 
         joiningScore + annualScore + bankScore
}
\`\`\`

#### Use Cases

1. **Card Tester**: Real-time scoring for any card selection
2. **Quick Recommendations**: Fast scoring without funnel
3. **Enhanced Personalization**: Direct scoring with full profile

---

## 5. Filtering Logic

### 5.1 Eligibility Filters

#### Income Filter
\`\`\`typescript
meetsIncome = card.monthlyIncomeRequirement === 0 || 
              userIncome >= card.monthlyIncomeRequirement
\`\`\`

**Examples**:
- Card requires ₹30,000, User has ₹50,000 → ✅ PASS
- Card requires ₹60,000, User has ₹50,000 → ❌ FAIL
- Card requires ₹0 (no requirement) → ✅ PASS (all users)

#### Credit Score Filter
\`\`\`typescript
meetsCredit = card.creditScoreRequirement === 0 || 
              userCreditScore >= card.creditScoreRequirement
\`\`\`

**Credit Score Ranges**:
| Range | Display | Numeric Value | Eligibility |
|-------|---------|---------------|-------------|
| 300-549 | Poor | 425 | Limited cards |
| 550-649 | Fair | 600 | Basic cards |
| 650-749 | Good | 700 | Most cards |
| 750-850 | Excellent | 800 | All cards |

#### Card Type Filter
\`\`\`typescript
matchesType = card.cardType === userRequestedType
\`\`\`

**Card Types**:
- Cashback
- Travel
- Rewards
- Fuel
- Shopping
- Premium
- Co-branded

### 5.2 Preference Filters

#### Joining Fee Preference

\`\`\`typescript
function filterByJoiningFee(cards, preference) {
  switch (preference) {
    case "free":        // ₹0
      return cards.filter(c => c.joiningFee === 0)
    case "low":         // ₹1-1,000
      return cards.filter(c => c.joiningFee <= 1000)
    case "medium":      // ₹1,001-3,000
      return cards.filter(c => c.joiningFee <= 3000)
    case "any_amount":  // No limit
      return cards
  }
}
\`\`\`

#### Brand Preference Filter

\`\`\`typescript
function filterByBrands(cards, preferredBrands) {
  if (preferredBrands.length === 0) return cards
  
  return cards.filter(card => 
    preferredBrands.some(brand => 
      card.bank.toLowerCase().includes(brand.toLowerCase()) ||
      brand.toLowerCase().includes(card.bank.toLowerCase())
    )
  )
}
\`\`\`

**Note**: Bidirectional matching handles variations:
- "HDFC" matches "HDFC Bank"
- "American Express" matches "Amex"
- "SBI" matches "SBI Cards"

### 5.3 Category Matching Logic

#### Matching Hierarchy

1. **Exact Match** (Highest Priority)
   \`\`\`
   userCategory === cardCategory
   Example: "Dining" === "Dining"
   \`\`\`

2. **Partial Match** (Medium Priority)
   \`\`\`
   userCategory.includes(cardCategory) || cardCategory.includes(userCategory)
   Example: "Online Shopping" includes "Shopping"
   \`\`\`

3. **Keyword Synonym Match** (Lower Priority)
   \`\`\`
   Keywords defined in mapping table
   Example: "Dining" ↔ ["Restaurant", "Food", "Eat", "Meal"]
   \`\`\`

#### Keyword Mappings

\`\`\`typescript
const categoryMappings = {
  // Food & Dining
  dining: ["restaurant", "food", "eat", "meal"],
  restaurant: ["dining", "food", "eat", "meal"],
  
  // Travel
  travel: ["hotel", "flight", "airline", "booking", "vacation"],
  hotel: ["travel", "booking", "accommodation", "stay"],
  
  // Shopping
  shopping: ["retail", "store", "purchase", "buy"],
  online: ["internet", "digital", "e-commerce", "web"],
  
  // Transportation
  fuel: ["gas", "petrol", "gasoline", "pump"],
  transport: ["taxi", "uber", "metro", "bus", "ride"],
  
  // Entertainment
  entertainment: ["movie", "cinema", "streaming", "show"],
  
  // Groceries
  grocery: ["supermarket", "food", "groceries", "market"],
  
  // Utilities
  utility: ["bill", "electric", "water", "internet", "phone"]
}
\`\`\`

---

## 6. Scoring Mechanisms

### 6.1 Funnel-Based Scoring

The funnel-based algorithm uses **scenario-based scoring** with dynamic weights:

#### Scoring Scenarios

| Scenario | Fee | Brand | Category | Rewards | Brand Match | Sign-up Bonus |
|----------|-----|-------|----------|---------|-------------|---------------|
| 1 | Zero | Yes | 30% | 20% | 50% | - |
| 2 | Zero | No | 30% | 60% | - | 10% |
| 3 | >0 | Yes | 30% | 20% | 50% | - |
| 4 | >0 | No | 30% | 60% | - | 10% |

#### Scenario 1: Zero Fee + Brand Match
\`\`\`typescript
// User wants free cards AND has brand preference
weights = {
  categoryMatch: 30,    // 30%
  rewardsRate: 20,      // 20%
  brandMatch: 50        // 50% (highest priority)
}
\`\`\`

**Rationale**: When user wants free cards and has brand preference, brand loyalty is most important.

#### Scenario 2: Zero Fee + No Brand Match
\`\`\`typescript
// User wants free cards, no brand preference
weights = {
  categoryMatch: 30,    // 30%
  rewardsRate: 60,      // 60% (highest priority)
  signUpBonus: 10       // 10%
}
\`\`\`

**Rationale**: Focus on maximum rewards since no brand preference.

#### Scenario 3: Paid Fee + Brand Match
\`\`\`typescript
// User accepts fees AND has brand preference
weights = {
  categoryMatch: 30,    // 30%
  rewardsRate: 20,      // 20%
  brandMatch: 50        // 50% (highest priority)
}
\`\`\`

**Rationale**: Similar to Scenario 1, brand loyalty dominates.

#### Scenario 4: Paid Fee + No Brand Match
\`\`\`typescript
// User accepts fees, no brand preference
weights = {
  categoryMatch: 30,    // 30%
  rewardsRate: 60,      // 60% (highest priority)
  signUpBonus: 10       // 10%
}
\`\`\`

**Rationale**: Focus on maximum value and rewards.

### 6.2 Score Normalization

All scoring uses **min-max normalization** to ensure fairness:

\`\`\`typescript
normalizedScore = (value / maxValue) * weight
\`\`\`

**Example**:
- Card A: 4% rewards, Max in DB: 5%
- Weight: 30 points
- Score: (4/5) × 30 = 24 points

### 6.3 Composite Scoring

Final card score is sum of all components:

\`\`\`typescript
finalScore = categoryScore + rewardsScore + brandScore + 
             signupScore + joiningScore + annualScore
\`\`\`

**Score Ranges**:
- **Excellent**: 80-100 points (Top recommendations)
- **Good**: 60-79 points (Strong contenders)
- **Fair**: 40-59 points (Acceptable options)
- **Poor**: 0-39 points (Not recommended)

---

## 7. User Journey

### 7.1 Basic Recommendation Flow

\`\`\`
┌──────────────────────────────────────────────────────────┐
│ Step 1: User Input                                       │
│ - Monthly Income: ₹50,000                               │
│ - Credit Score: 650-749 (Good)                          │
│ - Spending Categories: [Dining, Travel, Shopping]       │
│ - Preferred Brands: [HDFC, SBI] (Optional)             │
│ - Joining Fee: Low (≤₹1,000)                           │
└──────────────────┬───────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────┐
│ Step 2: Algorithm Processing                             │
│ - Load all cards from Google Sheets (Real-time)        │
│ - Apply funnel filtering (3 levels)                    │
│ - Calculate scores for eligible cards                  │
│ - Apply two-tier system                                │
│ - Generate TOP 7 recommendations                       │
└──────────────────┬───────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────┐
│ Step 3: Display Results                                  │
│ - Show preferred brand cards first (if any)            │
│ - Display general cards to fill TOP 7                  │
│ - Show detailed scoring breakdown                      │
│ - Provide category match analysis                      │
│ - Include reasoning for each recommendation            │
└──────────────────┬───────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────┐
│ Step 4: User Action                                      │
│ - View card details                                     │
│ - Click "Apply Now" (tracked)                          │
│ - Use Card Tester for exploration                      │
│ - Access Deep Dive analysis                            │
└──────────────────────────────────────────────────────────┘
\`\`\`

### 7.2 Enhanced Features

#### Card Tester
- **Purpose**: Real-time testing of any card against user profile
- **Features**:
  - Live search (300ms debounce)
  - Instant eligibility check
  - Detailed score breakdown
  - Category match analysis
  - Quick-select SBI cards
- **Use Case**: Research mode for users

#### Deep Dive Section

**Three Tabs**:

1. **Portfolio Analysis**
   - Upload financial documents (CSV)
   - Parse portfolio holdings
   - Generate interactive charts
   - Analyze spending patterns

2. **Card Comparison**
   - Side-by-side card comparison
   - Feature matrix
   - Cost-benefit analysis

3. **Learning Resources**
   - Credit card education
   - Best practices
   - Reward optimization tips

---

## 8. Integration Architecture

### 8.1 Google Sheets Integration

#### Data Source Schema

**Sheet: Credit Cards Database**

| Column | Data Type | Description | Constraints |
|--------|-----------|-------------|-------------|
| Card ID | String | Unique identifier | Required, Unique |
| Card Name | String | Display name | Required |
| Bank | String | Issuing bank | Required |
| Card Type | String | Category | Required |
| Joining Fee | Number | One-time fee | ≥0 |
| Annual Fee | Number | Yearly fee | ≥0 |
| Credit Score | Number | Minimum score | 300-850 |
| Income | Number | Minimum income | ≥0 |
| Rewards Rate | Number | Percentage | 0-100 |
| Sign-up Bonus | Number | Bonus amount | ≥0 |
| Features | String | JSON array | Array format |
| Description | String | Card description | - |
| Categories | String | JSON array | Array format |

#### API Integration

**Fetch Cards**:
\`\`\`typescript
// Server Action
export async function fetchCreditCardsAction() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  // Parse and transform data
  return transformSheetData(data.values)
}
\`\`\`

**Rate Limits**:
- Read: 60 requests/minute/user
- Caching: Client-side (5 minutes)
- Error Handling: Retry with exponential backoff

### 8.2 Google Apps Script Integration

#### Form Submission Webhook

**Script Function**:
\`\`\`javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
                              .getSheetByName('Form-Submissions')
  
  const data = JSON.parse(e.postData.contents)
  
  // Append row to sheet
  sheet.appendRow([
    new Date(),
    data.monthlyIncome,
    data.creditScore,
    data.spendingCategories.join(', '),
    data.preferredBanks.join(', '),
    data.submissionType
  ])
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true })
  ).setMimeType(ContentService.MimeType.JSON)
}
\`\`\`

**Deployment**:
1. Create new Apps Script project
2. Deploy as Web App
3. Set permissions: Anyone (anonymous)
4. Copy deployment URL
5. Add to environment variables

### 8.3 Security Considerations

#### Environment Variables

\`\`\`env
# Public (Client-side)
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=<API_KEY>
NEXT_PUBLIC_APPS_SCRIPT_URL=<SCRIPT_URL>

# Server-only
GOOGLE_SHEETS_API_KEY=<API_KEY>
\`\`\`

**Security Measures**:
- ✅ API key restricted to Google Sheets API only
- ✅ IP restrictions on API key
- ✅ Read-only permissions on sheets
- ✅ HTTPS only
- ✅ Rate limiting implemented
- ✅ Server Actions for sensitive operations

---

## 9. Analytics & Tracking

### 9.1 Submission Tracking

**Captured Data Points**:

\`\`\`typescript
interface SubmissionData {
  timestamp: string              // ISO 8601 format
  monthlyIncome: number          // User income
  monthlySpending: number        // User spending
  creditScoreRange: string       // Score bracket
  currentCards: string           // Number of cards
  spendingCategories: string[]   // Selected categories
  preferredBanks: string[]       // Selected brands
  joiningFeePreference: string   // Fee preference
  submissionType: string         // Algorithm used
  userAgent: string             // Browser info
  sessionId?: string            // Session identifier
}
\`\`\`

**Storage**: Google Sheets "Form-Submissions" tab

### 9.2 Click Tracking

**Card Application Clicks**:

\`\`\`typescript
interface ClickData {
  timestamp: string              // Click time
  cardName: string              // Card clicked
  bankName: string              // Card issuer
  cardType: string              // Card category
  joiningFee: number            // Card joining fee
  annualFee: number             // Card annual fee
  rewardRate: string            // Reward percentage
  submissionType: string        // Click event type
  userAgent: string            // Browser info
  sessionId: string            // Session identifier
}
\`\`\`

**Tracking Function**:
\`\`\`typescript
export async function trackCardApplicationClick(clickData) {
  await submitToGoogleSheets({
    ...clickData,
    submissionType: 'card_application_click'
  })
}
\`\`\`

### 9.3 Analytics Dashboard

**Key Metrics**:

1. **Submission Metrics**:
   - Total submissions
   - Submissions by algorithm
   - Average income range
   - Most popular categories
   - Most selected brands

2. **Card Performance**:
   - Click-through rate by card
   - Application rate by bank
   - Category popularity
   - Fee preference distribution

3. **User Behavior**:
   - Session duration
   - Page views
   - Funnel completion rate
   - Tester usage rate

---

## 10. Success Criteria

### 10.1 Functional Requirements

| Requirement | Criteria | Status |
|-------------|----------|--------|
| Card Fetching | Real-time data from Google Sheets | ✅ Implemented |
| Basic Filtering | Income + Credit Score eligibility | ✅ Implemented |
| Category Matching | >65% match threshold | ✅ Implemented |
| Fee Filtering | 3-tier preference system | ✅ Implemented |
| Brand Prioritization | Two-tier recommendation | ✅ Implemented |
| Score Calculation | Multi-scenario scoring | ✅ Implemented |
| TOP 7 Limit | Maximum 7 recommendations | ✅ Implemented |
| Submission Tracking | Google Sheets logging | ✅ Implemented |
| Click Tracking | Application click logging | ✅ Implemented |

### 10.2 Performance Requirements

| Metric | Target | Current |
|--------|--------|---------|
| Page Load Time | <2s | ~1.5s |
| API Response Time | <1s | ~800ms |
| Search Debounce | 300ms | 300ms |
| Card Calculation | <500ms | ~300ms |
| Recommendation Display | <2s | ~1.8s |

### 10.3 User Experience Requirements

| Feature | Requirement | Status |
|---------|-------------|--------|
| Mobile Responsive | Works on all devices | ✅ Implemented |
| Form Validation | Real-time validation | ✅ Implemented |
| Error Handling | Clear error messages | ✅ Implemented |
| Loading States | Visual feedback | ✅ Implemented |
| Accessibility | WCAG 2.1 AA compliant | ✅ Implemented |

### 10.4 Business Requirements

| Requirement | Description | Status |
|-------------|-------------|--------|
| Transparency | Show scoring breakdown | ✅ Implemented |
| Personalization | Tailored recommendations | ✅ Implemented |
| Brand Preference | Honor user brand choices | ✅ Implemented |
| Comparison | Card-by-card analysis | ✅ Implemented |
| Education | Learning resources | ⏳ Planned |

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **Funnel** | Multi-stage filtering process |
| **Two-Tier** | Preferred + General recommendation system |
| **Category Match** | Overlap between user and card spending categories |
| **Composite Score** | Weighted sum of all scoring factors |
| **Normalization** | Scaling values to a standard range |
| **Threshold** | Minimum requirement for filtering |
| **Server Action** | Next.js server-side function |
| **Real-time** | Data fetched live from source |

### B. Algorithm Comparison

| Feature | Funnel-Based | Adaptive Intersection | Refined Scoring |
|---------|--------------|----------------------|-----------------|
| **Primary Use** | Main recommendations | Category-focused | Quick testing |
| **Filtering** | 3-level funnel | Basic eligibility | Basic eligibility |
| **Category Weight** | 30% | 40% | 30% |
| **Brand Handling** | Two-tier system | Bonus scoring | Bonus scoring |
| **Max Results** | 7 (enforced) | 7 (enforced) | 7 (enforced) |
| **Complexity** | High | Medium | Low |
| **Best For** | Complete profile | Category shoppers | Quick lookup |

### C. Category Hierarchy

\`\`\`
Categories (47 total)
├── Food & Dining (8)
│   ├── Dining
│   ├── Restaurant
│   ├── Food
│   ├── Meal
│   └── ...
├── Travel (12)
│   ├── Travel
│   ├── Hotel
│   ├── Flight
│   ├── Airline
│   └── ...
├── Shopping (10)
│   ├── Shopping
│   ├── Online Shopping
│   ├── Retail
│   └── ...
├── Transportation (8)
│   ├── Fuel
│   ├── Gas
│   ├── Transport
│   └── ...
└── Other (9)
    ├── Entertainment
    ├── Grocery
    ├── Utility
    └── ...
\`\`\`

### D. Bank List (30 brands)

**Public Sector**:
- SBI, PNB, Bank of Baroda, Canara Bank, Indian Bank, Union Bank, Central Bank, BOI, IOB

**Private Sector**:
- HDFC, ICICI Bank, Axis Bank, Kotak, Yes Bank, IndusInd Bank, Federal Bank, RBL

**Foreign Banks**:
- Citi, Standard Chartered, HSBC, Barclays, American Express

**Fintech/Digital**:
- Bajaj, Tata, Slice, Uni, Jupiter, Niyo

**Others**:
- FIRST, SIB

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2024 | Product Team | Initial draft |
| 1.5 | Jan 2025 | Tech Team | Added algorithms |
| 2.0 | Jan 2025 | Product Team | Complete BRD with all logic |

---

**END OF DOCUMENT**
