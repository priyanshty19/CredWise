# CredWise - Business Requirements Document (BRD)
## Credit Card Recommendation System

**Version:** 3.0  
**Last Updated:** January 2025  
**Document Owner:** Product Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Data Model](#data-model)
4. [Recommendation Algorithm](#recommendation-algorithm)
5. [Filtering Logic](#filtering-logic)
6. [Scoring Mechanisms](#scoring-mechanisms)
7. [User Journey](#user-journey)
8. [Integration Architecture](#integration-architecture)
9. [Analytics & Tracking](#analytics--tracking)
10. [Success Criteria](#success-criteria)

---

## 1. Executive Summary

CredWise is an intelligent credit card recommendation platform that matches users with optimal credit cards based on their financial profile, spending patterns, and preferences. The system implements a sophisticated **Funnel-Based Two-Tier Recommendation Engine** to ensure highly personalized recommendations.

### Key Features
- **Funnel-Based Filtering**: 3-level eligibility screening
- **Two-Tier Recommendation System**: Preferred brand prioritization
- **TOP 7 Card Limit**: Maximum 7 recommendations per request
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
│  - Enhanced Recommendations Display                          │
│  - Deep Dive Section                                         │
│  - Portfolio Analysis                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  - Funnel-Based Two-Tier Recommendation Engine              │
│  - Portfolio Parser                                          │
│  - Category Matching System                                  │
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

## 4. Recommendation Algorithm

### 4.1 Funnel-Based Two-Tier Recommendation Engine

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

---

## 5. Filtering Logic

### 5.1 Level 1: Basic Eligibility

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

### 5.2 Level 2: Category Matching

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

**Matching Examples**:

\`\`\`typescript
// Example 1: Exact Match
user: ["Dining"]
card: ["Dining", "Travel"]
match: "Dining" === "Dining" ✅
result: 1/1 = 100% ✅ PASS

// Example 2: Partial Match
user: ["Online Shopping"]
card: ["Shopping", "Electronics"]
match: "Online Shopping" includes "Shopping" ✅
result: 1/1 = 100% ✅ PASS

// Example 3: Synonym Match
user: ["Dining"]
card: ["Restaurant", "Food"]
match: "Dining" synonyms include "Restaurant" ✅
result: 1/1 = 100% ✅ PASS

// Example 4: Below Threshold
user: ["Dining", "Travel", "Shopping"]
card: ["Dining", "Entertainment"]
matches: ["Dining"]
result: 1/3 = 33.3% ❌ FAIL (< 65%)

// Example 5: Exactly at Threshold
user: ["Dining", "Travel", "Shopping"]
card: ["Restaurant", "Hotel"]
matches: ["Dining", "Travel"] (via synonyms)
result: 2/3 = 66.7% ✅ PASS (> 65%)
\`\`\`

### 5.3 Level 3: Joining Fee Filtering

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

**Fee Filter Logic Table**:

| User Preference | Logic | Examples |
|----------------|-------|----------|
| `no_fee` | `fee === 0` | ₹0 ✅, ₹500 ❌, ₹1000 ❌ |
| `low_fee` | `fee <= 1000` | ₹0 ✅, ₹500 ✅, ₹1000 ✅, ₹1001 ❌ |
| `no_concern` | `true` | ₹0 ✅, ₹500 ✅, ₹5000 ✅ |

---

## 6. Scoring Mechanisms

### 6.1 Two-Tier Recommendation System

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

### 6.2 Scenario-Based Scoring

The algorithm uses **scenario-based scoring** with dynamic weights:

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

### 6.3 Score Calculation

**Scoring Formula**:
\`\`\`typescript
function calculateScore(card, userProfile, scenario) {
  // 1. Category Match Score (0-30 points)
  const categoryScore = (matchPercentage / 100) * weights.categoryMatch
  
  // 2. Rewards Rate Score (0-20 or 0-60 points)
  const rewardsScore = (card.rewardsRate / maxRewards) * weights.rewardsRate
  
  // 3. Brand Match Score (0-50 points if applicable)
  const brandScore = isPreferredBrand ? weights.brandMatch : 0
  
  // 4. Sign-up Bonus Score (0-10 points if applicable)
  const signupScore = (card.signUpBonus / maxSignup) * weights.signUpBonus
  
  return categoryScore + rewardsScore + brandScore + signupScore
}
\`\`\`

**Example Calculation**:

**User Profile**:
- Categories: ["Dining", "Travel", "Shopping"]
- Preferred Banks: ["HDFC"]
- Fee Preference: "no_fee"

**Card: HDFC Regalia First Year Free**:
- Categories: ["Dining", "Hotel", "Airport Lounge"]
- Rewards: 4%
- Sign-up: ₹10,000
- Joining: ₹0

**Scenario**: Zero Fee + Brand Match (Scenario 1)

**Score Calculation**:

1. **Category Match** (30 points max):
   - User: ["Dining", "Travel", "Shopping"]
   - Card: ["Dining", "Hotel", "Airport Lounge"]
   - Matches: Dining (exact), Hotel (synonym: Travel) = 2/3
   - Score: (2/3) × 30 = **20.0 points**

2. **Rewards Rate** (20 points max):
   - Card: 4%, Max in DB: 5%
   - Score: (4/5) × 20 = **16.0 points**

3. **Brand Match** (50 points max):
   - User prefers HDFC, Card is HDFC
   - Score: **50.0 points**

**Total Score**: 20.0 + 16.0 + 50.0 = **86.0 / 100**

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
   - Recommendation acceptance rate

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

### B. Category Hierarchy

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

### C. Bank List (30 brands)

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
| 3.0 | Jan 2025 | Tech Team | Removed inactive algorithms, kept only Funnel-Based Two-Tier |

---

**END OF DOCUMENT**
\`\`\`

Now let's update the Algorithm Detailed Specification:
