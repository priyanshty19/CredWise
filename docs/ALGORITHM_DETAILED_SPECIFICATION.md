# CredWise - Algorithm Detailed Specification
## Technical Implementation Guide

**Version:** 1.0  
**Last Updated:** January 2025  
**Target Audience:** Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [Algorithm 1: Funnel-Based Engine](#algorithm-1-funnel-based-engine)
3. [Algorithm 2: Adaptive Intersection](#algorithm-2-adaptive-intersection)
4. [Algorithm 3: Refined Scoring](#algorithm-3-refined-scoring)
5. [Category Matching System](#category-matching-system)
6. [Two-Tier System](#two-tier-system)
7. [Testing Scenarios](#testing-scenarios)

---

## 1. Overview

### Algorithm Selection Matrix

\`\`\`
User Scenario → Recommended Algorithm
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Complete Profile Entry
└── Full form with categories + brands
    └── Use: Funnel-Based Engine ✓

Category-Focused Search
└── User knows spending categories
    └── Use: Adaptive Intersection ✓

Quick Card Lookup
└── Testing specific cards
    └── Use: Refined Scoring ✓
\`\`\`

---

## 2. Algorithm 1: Funnel-Based Engine

### 2.1 Complete Flow Diagram

\`\`\`
                        ┌─────────────────┐
                        │  Start Request  │
                        └────────┬────────┘
                                 ↓
                    ╔════════════════════════╗
                    ║  Parse User Profile    ║
                    ║  - Income: number      ║
                    ║  - Credit: number      ║
                    ║  - Categories: []      ║
                    ║  - Brands: []          ║
                    ║  - Fee Pref: string    ║
                    ╚════════════╦═══════════╝
                                 ↓
                    ╔════════════════════════╗
                    ║  Fetch All Cards       ║
                    ║  from Google Sheets    ║
                    ║  (Real-time API call)  ║
                    ╚════════════╦═══════════╝
                                 ↓
        ┌────────────────────────────────────────────┐
        │                                            │
        │        LEVEL 1: BASIC ELIGIBILITY         │
        │                                            │
        │  For each card:                           │
        │    if income >= required_income AND       │
        │       credit >= required_credit           │
        │    then PASS                              │
        │    else REJECT                            │
        │                                            │
        └─────────────────┬──────────────────────────┘
                          ↓
                ┌─────────────────┐
                │  Level 1 Cards  │
                │   (Eligible)    │
                └────────┬─────────┘
                         ↓
        ┌────────────────────────────────────────────┐
        │                                            │
        │      LEVEL 2: CATEGORY MATCHING           │
        │                                            │
        │  For each card:                           │
        │    matches = countMatches(                │
        │      user.categories,                     │
        │      card.categories                      │
        │    )                                      │
        │    percentage = matches / user.count      │
        │    if percentage > 0.65                   │
        │    then PASS                              │
        │    else REJECT                            │
        │                                            │
        └─────────────────┬──────────────────────────┘
                          ↓
                ┌─────────────────┐
                │  Level 2 Cards  │
                │ (Cat Matched)   │
                └────────┬─────────┘
                         ↓
        ┌────────────────────────────────────────────┐
        │                                            │
        │     LEVEL 3: JOINING FEE FILTER           │
        │                                            │
        │  switch (user.feePreference)              │
        │    case "no_fee":                         │
        │      keep cards where fee = 0             │
        │    case "low_fee":                        │
        │      keep cards where fee <= 1000         │
        │    case "no_concern":                     │
        │      keep all cards                       │
        │                                            │
        └─────────────────┬──────────────────────────┘
                          ↓
                ┌─────────────────┐
                │  Level 3 Cards  │
                │ (Fee Filtered)  │
                └────────┬─────────┘
                         ↓
        ┌────────────────────────────────────────────┐
        │                                            │
        │         TWO-TIER SYSTEM                   │
        │                                            │
        │  TIER 1: Preferred Brands                 │
        │    filter: card.bank in user.brands       │
        │    score & rank                           │
        │    take top 7                             │
        │                                            │
        │  TIER 2: General Cards (if needed)        │
        │    remaining = 7 - tier1.count            │
        │    filter: exclude tier1 cards            │
        │    score & rank                           │
        │    take top 'remaining'                   │
        │                                            │
        │  COMBINE:                                 │
        │    [...tier1, ...tier2].slice(0, 7)       │
        │                                            │
        └─────────────────┬──────────────────────────┘
                          ↓
                ┌─────────────────┐
                │   TOP 7 CARDS   │
                │  (Final Output) │
                └─────────────────┘
\`\`\`

### 2.2 Detailed Level Implementations

#### Level 1: Basic Eligibility

\`\`\`typescript
/**
 * Level 1: Basic Eligibility Check
 * 
 * Purpose: Filter cards that user qualifies for based on hard requirements
 * 
 * @param allCards - All cards from database
 * @param userIncome - User's monthly income in rupees
 * @param userCreditScore - User's credit score (300-850)
 * @returns Cards that meet basic eligibility
 */
function level1BasicEligibility(
  allCards: CreditCard[],
  userIncome: number,
  userCreditScore: number
): CreditCard[] {
  
  console.log(`🔍 Level 1: Checking ${allCards.length} cards`)
  
  const eligible = allCards.filter(card => {
    // Income Check
    const meetsIncome = 
      card.monthlyIncomeRequirement === 0 ||  // No requirement
      userIncome >= card.monthlyIncomeRequirement
    
    // Credit Score Check
    const meetsCredit = 
      card.creditScoreRequirement === 0 ||     // No requirement
      userCreditScore >= card.creditScoreRequirement
    
    // Detailed logging
    if (!meetsIncome || !meetsCredit) {
      console.log(`❌ ${card.cardName}:`, {
        income: meetsIncome ? '✓' : `✗ (need ₹${card.monthlyIncomeRequirement})`,
        credit: meetsCredit ? '✓' : `✗ (need ${card.creditScoreRequirement})`
      })
    }
    
    return meetsIncome && meetsCredit
  })
  
  console.log(`✅ Level 1 Result: ${eligible.length}/${allCards.length} cards passed`)
  
  return eligible
}
\`\`\`

**Edge Cases**:

1. **Zero Requirements**:
   \`\`\`typescript
   // Card has no income requirement
   card.monthlyIncomeRequirement === 0
   // Result: All users eligible (income check passes)
   \`\`\`

2. **Exact Match**:
   \`\`\`typescript
   // User has exactly required income
   userIncome === card.monthlyIncomeRequirement
   // Result: Passes (>= condition)
   \`\`\`

3. **No Eligible Cards**:
   \`\`\`typescript
   if (eligible.length === 0) {
     // Return early with empty recommendations
     // Show message: "No cards match your profile"
   }
   \`\`\`

#### Level 2: Category Matching

\`\`\`typescript
/**
 * Level 2: Category Preference Filtering
 * 
 * Purpose: Keep only cards that match user's spending categories well
 * 
 * @param level1Cards - Cards that passed Level 1
 * @param userCategories - User's selected spending categories
 * @returns Cards with >65% category match
 */
function level2CategoryFiltering(
  level1Cards: CreditCard[],
  userCategories: string[]
): CreditCard[] {
  
  console.log(`🛍️ Level 2: Checking ${level1Cards.length} cards for category match`)
  console.log(`User Categories: [${userCategories.join(', ')}]`)
  
  // If no categories selected, pass all cards
  if (userCategories.length === 0) {
    console.log('⚠️ No categories selected, passing all cards')
    return level1Cards
  }
  
  const matched = level1Cards.filter(card => {
    const { matchPercentage, matchedCategories } = 
      calculateCategoryMatchPercentage(userCategories, card.spendingCategories)
    
    const passes = matchPercentage > 65
    
    console.log(`${passes ? '✅' : '❌'} ${card.cardName}:`, {
      percentage: `${matchPercentage.toFixed(1)}%`,
      matches: `${matchedCategories.length}/${userCategories.length}`,
      categories: matchedCategories
    })
    
    return passes
  })
  
  console.log(`✅ Level 2 Result: ${matched.length}/${level1Cards.length} cards passed`)
  
  return matched
}
\`\`\`

**Category Matching Algorithm**:

\`\`\`typescript
/**
 * Calculate category match percentage with flexible matching
 */
function calculateCategoryMatchPercentage(
  userCategories: string[],
  cardCategories: string[]
): { matchPercentage: number; matchedCategories: string[] } {
  
  if (userCategories.length === 0) {
    return { matchPercentage: 0, matchedCategories: [] }
  }
  
  // Normalize for case-insensitive comparison
  const normalizedUser = userCategories.map(c => c.toLowerCase().trim())
  const normalizedCard = cardCategories.map(c => c.toLowerCase().trim())
  
  const matched: string[] = []
  
  // Check each user category
  for (const userCat of normalizedUser) {
    let foundMatch = false
    
    for (const cardCat of normalizedCard) {
      // Try matching in order of precision
      if (
        exactMatch(userCat, cardCat) ||
        partialMatch(userCat, cardCat) ||
        synonymMatch(userCat, cardCat)
      ) {
        matched.push(userCat)
        foundMatch = true
        break  // Count each user category only once
      }
    }
  }
  
  const matchPercentage = (matched.length / userCategories.length) * 100
  
  return { matchPercentage, matchedCategories: matched }
}

// Exact match: "dining" === "dining"
function exactMatch(a: string, b: string): boolean {
  return a === b
}

// Partial match: "online shopping" includes "shopping"
function partialMatch(a: string, b: string): boolean {
  return a.includes(b) || b.includes(a)
}

// Synonym match: "dining" matches "restaurant"
function synonymMatch(a: string, b: string): boolean {
  const synonyms = getCategorySynonyms(a)
  return synonyms.some(syn => b.includes(syn))
}
\`\`\`

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

#### Level 3: Joining Fee Filtering

\`\`\`typescript
/**
 * Level 3: Joining Fee and Brand Filtering
 * 
 * Purpose: Apply user's fee preference
 * 
 * @param level2Cards - Cards that passed Level 2
 * @param feePreference - User's fee preference
 * @returns Filtered cards and available brands
 */
function level3JoiningFeeAndBrandFiltering(
  level2Cards: CreditCard[],
  feePreference: 'no_fee' | 'low_fee' | 'no_concern'
): { level3Cards: CreditCard[]; availableBrands: string[] } {
  
  console.log(`💳 Level 3: Applying fee filter "${feePreference}"`)
  
  let filtered: CreditCard[] = []
  
  switch (feePreference) {
    case 'no_fee':
      filtered = level2Cards.filter(card => card.joiningFee === 0)
      console.log(`Keeping only free cards (₹0 joining fee)`)
      break
      
    case 'low_fee':
      filtered = level2Cards.filter(card => card.joiningFee <= 1000)
      console.log(`Keeping cards with fee ≤ ₹1,000`)
      break
      
    case 'no_concern':
      filtered = level2Cards
      console.log(`No fee filtering applied (all cards pass)`)
      break
  }
  
  // Extract unique brands
  const brands = [...new Set(filtered.map(card => card.bank))].sort()
  
  console.log(`✅ Level 3 Result: ${filtered.length}/${level2Cards.length} cards passed`)
  console.log(`Available Brands: [${brands.join(', ')}]`)
  
  return {
    level3Cards: filtered,
    availableBrands: brands
  }
}
\`\`\`

**Fee Filter Logic Table**:

| User Preference | Logic | Examples |
|----------------|-------|----------|
| `no_fee` | `fee === 0` | ₹0 ✅, ₹500 ❌, ₹1000 ❌ |
| `low_fee` | `fee <= 1000` | ₹0 ✅, ₹500 ✅, ₹1000 ✅, ₹1001 ❌ |
| `no_concern` | `true` | ₹0 ✅, ₹500 ✅, ₹5000 ✅ |

### 2.3 Two-Tier System Implementation

\`\`\`typescript
/**
 * Two-Tier Recommendation System
 * 
 * Purpose: Prioritize preferred brands while ensuring TOP 7 recommendations
 * 
 * Flow:
 * 1. If user selected brands → TIER 1: Filter & score preferred brand cards
 * 2. If TIER 1 < 7 cards → TIER 2: Fill remaining slots with general cards
 * 3. Combine tiers, enforce 7-card limit
 * 
 * @param level3Cards - Cards that passed Level 3
 * @param userProfile - Complete user profile
 * @returns Two-tier result with final TOP 7
 */
function twoTierRecommendationSystem(
  level3Cards: CreditCard[],
  userProfile: UserProfile
): TwoTierResult {
  
  console.log(`🎯 Two-Tier System: Processing ${level3Cards.length} cards`)
  
  // Handle empty input
  if (level3Cards.length === 0) {
    return {
      preferredBrandCards: [],
      generalCards: [],
      showGeneralMessage: false,
      finalTop7: []
    }
  }
  
  let preferredBrandCards: ScoredCard[] = []
  let generalCards: ScoredCard[] = []
  let showGeneralMessage = false
  
  // ═══════════════════════════════════════════════════════
  //  TIER 1: PREFERRED BRAND RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════
  
  if (userProfile.preferredBrands.length > 0) {
    console.log(`🏦 TIER 1: Filtering for brands [${userProfile.preferredBrands.join(', ')}]`)
    
    // Filter cards matching user's preferred brands
    const brandMatched = level3Cards.filter(card =>
      userProfile.preferredBrands.includes(card.bank)
    )
    
    console.log(`Found ${brandMatched.length} preferred brand cards`)
    
    if (brandMatched.length > 0) {
      // Score and sort preferred brand cards
      const scored = scoreAndSortCards(
        brandMatched,
        userProfile,
        'preferred_brand'
      )
      
      // Take top 7 (maximum)
      preferredBrandCards = scored.slice(0, 7)
      
      console.log(`✅ TIER 1 Result: ${preferredBrandCards.length} cards selected`)
    } else {
      console.log(`⚠️ No preferred brand cards found`)
    }
    
    // ═══════════════════════════════════════════════════════
    //  TIER 2: GENERAL RECOMMENDATIONS (if needed)
    // ═══════════════════════════════════════════════════════
    
    if (preferredBrandCards.length < 7) {
      const remainingSlots = 7 - preferredBrandCards.length
      
      console.log(`🌐 TIER 2: Need ${remainingSlots} more cards to reach TOP 7`)
      
      // Exclude cards already in TIER 1
      const generalCandidates = level3Cards.filter(card =>
        !preferredBrandCards.some(pref => pref.card.id === card.id)
      )
      
      console.log(`Found ${generalCandidates.length} general candidates`)
      
      if (generalCandidates.length > 0) {
        // Score and sort general cards
        const scored = scoreAndSortCards(
          generalCandidates,
          userProfile,
          'general'
        )
        
        // Take only what's needed to fill TOP 7
        generalCards = scored.slice(0, remainingSlots)
        
        console.log(`✅ TIER 2 Result: ${generalCards.length} cards selected`)
        
        // Show message if we're mixing tiers
        showGeneralMessage = true
      } else {
        console.log(`⚠️ No additional cards available`)
      }
    }
    
  } else {
    // ═══════════════════════════════════════════════════════
    //  NO PREFERRED BRANDS: Use general recommendations only
    // ═══════════════════════════════════════════════════════
    
    console.log(`🌐 No preferred brands selected, using general recommendations`)
    
    const scored = scoreAndSortCards(
      level3Cards,
      userProfile,
      'general'
    )
    
    generalCards = scored.slice(0, 7)
    
    console.log(`✅ General Result: ${generalCards.length} cards selected`)
    
    showGeneralMessage = false
  }
  
  // ═══════════════════════════════════════════════════════
  //  COMBINE TIERS & ENFORCE 7-CARD LIMIT
  // ═══════════════════════════════════════════════════════
  
  const finalTop7 = [
    ...preferredBrandCards,
    ...generalCards
  ].slice(0, 7)  // Double-check 7-card limit
  
  console.log(`🏆 Final TOP 7: ${finalTop7.length} cards`)
  console.log(`   Preferred: ${preferredBrandCards.length}`)
  console.log(`   General: ${generalCards.length}`)
  console.log(`   Show Message: ${showGeneralMessage}`)
  
  return {
    preferredBrandCards,
    generalCards,
    showGeneralMessage,
    finalTop7
  }
}
\`\`\`

**Two-Tier Scenarios**:

\`\`\`typescript
// Scenario 1: Sufficient Preferred Brand Cards
// User selected: ["HDFC", "SBI"]
// Level 3 cards: 10 total (8 HDFC/SBI, 2 others)
// Result: 7 preferred brand cards
preferredBrandCards: 7
generalCards: 0
showGeneralMessage: false
message: "All recommendations are from your preferred brands"

// Scenario 2: Partial Preferred Brand Cards
// User selected: ["American Express"]
// Level 3 cards: 10 total (3 Amex, 7 others)
// Result: 3 preferred + 4 general = 7 total
preferredBrandCards: 3
generalCards: 4
showGeneralMessage: true
message: "Your selected brand does not have sufficient cards. 
         Here are other cards to complete TOP 7."

// Scenario 3: No Preferred Brands Selected
// User selected: []
// Level 3 cards: 10 total
// Result: 7 best general cards
preferredBrandCards: 0
generalCards: 7
showGeneralMessage: false
message: "Top recommendations based on your profile"

// Scenario 4: Insufficient Total Cards
// User selected: ["HDFC"]
// Level 3 cards: 4 total (2 HDFC, 2 others)
// Result: 2 preferred + 2 general = 4 total
preferredBrandCards: 2
generalCards: 2
showGeneralMessage: true
message: "Showing all 4 available cards matching your criteria"
\`\`\`

### 2.4 Scoring Logic

\`\`\`typescript
/**
 * Score and Sort Cards
 * 
 * Uses scenario-based scoring with dynamic weights
 * 
 * @param cards - Cards to score
 * @param userProfile - User profile
 * @param tier - Tier type (affects brand scoring)
 * @returns Scored and sorted cards
 */
function scoreAndSortCards(
  cards: CreditCard[],
  userProfile: UserProfile,
  tier: 'preferred_brand' | 'general'
): ScoredCard[] {
  
  // Determine scoring scenario
  const hasZeroFee = userProfile.joiningFeePreference === 'no_fee'
  const hasBrandPref = userProfile.preferredBrands.length > 0 && 
                       tier === 'preferred_brand'
  
  // Select weights based on scenario
  let weights: ScoringWeights
  let scenario: string
  
  if (hasZeroFee && hasBrandPref) {
    scenario = 'Zero Fee + Brand Match'
    weights = {
      categoryMatch: 30,
      rewardsRate: 20,
      brandMatch: 50
    }
  } else if (hasZeroFee && !hasBrandPref) {
    scenario = 'Zero Fee + No Brand Match'
    weights = {
      categoryMatch: 30,
      rewardsRate: 60,
      signUpBonus: 10
    }
  } else if (!hasZeroFee && hasBrandPref) {
    scenario = 'Fee >0 + Brand Match'
    weights = {
      categoryMatch: 30,
      rewardsRate: 20,
      brandMatch: 50
    }
  } else {
    scenario = 'Fee >0 + No Brand Match'
    weights = {
      categoryMatch: 30,
      rewardsRate: 60,
      signUpBonus: 10
    }
  }
  
  console.log(`📊 Scoring with: ${scenario}`)
  console.log(`Weights:`, weights)
  
  // Calculate max values for normalization
  const maxRewards = Math.max(...cards.map(c => c.rewardsRate), 1)
  const maxSignUp = Math.max(...cards.map(c => c.signUpBonus), 1)
  
  // Score each card
  const scored: ScoredCard[] = cards.map(card => {
    
    // 1. Category Match Score
    const { matchPercentage, matchedCategories } = 
      calculateCategoryMatchPercentage(
        userProfile.spendingCategories,
        card.spendingCategories
      )
    const categoryScore = (matchPercentage / 100) * weights.categoryMatch
    
    // 2. Rewards Rate Score (normalized)
    const rewardsScore = (card.rewardsRate / maxRewards) * weights.rewardsRate
    
    // 3. Brand Match Score (if applicable)
    let brandScore = 0
    if (weights.brandMatch) {
      brandScore = userProfile.preferredBrands.includes(card.bank) 
        ? weights.brandMatch 
        : 0
    }
    
    // 4. Sign-up Bonus Score (if applicable)
    let signUpScore = 0
    if (weights.signUpBonus) {
      signUpScore = (card.signUpBonus / maxSignUp) * weights.signUpBonus
    }
    
    // Total score
    const totalScore = categoryScore + rewardsScore + brandScore + signUpScore
    
    // Generate reasoning
    const reasoning = generateReasoning(
      card,
      matchPercentage,
      scenario,
      userProfile,
      tier
    )
    
    return {
      card,
      score: totalScore,
      scoreBreakdown: {
        categoryMatch: categoryScore,
        rewardsRate: rewardsScore,
        brandMatch: brandScore,
        signUpBonus: signUpScore
      },
      matchPercentage,
      reasoning,
      tier
    }
  })
  
  // Sort by score (highest first)
  return scored.sort((a, b) => b.score - a.score)
}
\`\`\`

**Scoring Example**:

\`\`\`typescript
// Scenario: Fee >0 + No Brand Match
// Weights: Category 30%, Rewards 60%, Sign-up 10%

Card: HDFC Regalia
- Category Match: 66.7% (2/3) → (0.667 × 30) = 20.0 points
- Rewards Rate: 4% (max 5%) → (4/5 × 60) = 48.0 points
- Sign-up Bonus: ₹10,000 (max ₹15,000) → (10000/15000 × 10) = 6.7 points
- Total: 20.0 + 48.0 + 6.7 = 74.7 / 100

Card: SBI Cashback
- Category Match: 100% (3/3) → (1.0 × 30) = 30.0 points
- Rewards Rate: 5% (max 5%) → (5/5 × 60) = 60.0 points
- Sign-up Bonus: ₹5,000 (max ₹15,000) → (5000/15000 × 10) = 3.3 points
- Total: 30.0 + 60.0 + 3.3 = 93.3 / 100

Result: SBI Cashback ranks higher (93.3 > 74.7)
\`\`\`

---

## 3. Algorithm 2: Adaptive Intersection

### 3.1 Core Concept

The Adaptive Intersection algorithm focuses on **category overlap** as the primary ranking factor.

**Philosophy**: 
> "The best card is one that covers the most of your spending categories"

### 3.2 Implementation

\`\`\`typescript
/**
 * Adaptive Intersection-Based Recommendation
 * 
 * Prioritizes category intersection with additional scoring factors
 * 
 * @param cards - All cards from database
 * @param userPreferences - User's preferences
 * @param maxResults - Maximum recommendations (default 7)
 * @returns Recommendation result with statistics
 */
export function getAdaptiveCardRecommendations(
  cards: CreditCard[],
  userPreferences: UserPreferences,
  maxResults = 7
): RecommendationResult {
  
  console.log('🎯 ADAPTIVE INTERSECTION-BASED ALGORITHM')
  console.log('='.repeat(70))
  
  // STEP 1: Basic Eligibility
  const eligible = cards.filter(card => {
    const meetsCredit = card.creditScoreRequirement === 0 ||
                        userPreferences.creditScore >= card.creditScoreRequirement
    
    const meetsIncome = card.monthlyIncomeRequirement === 0 ||
                        userPreferences.monthlyIncome >= card.monthlyIncomeRequirement
    
    const meetsFee = checkJoiningFeeEligibility(
      card.joiningFee,
      userPreferences.joiningFeePreference
    )
    
    return meetsCredit && meetsIncome && meetsFee
  })
  
  console.log(`✅ Eligible cards: ${eligible.length}`)
  
  // STEP 2: Calculate Intersection Scores
  const scored = eligible.map(card => {
    
    // Calculate intersection
    const intersection = calculateCategoryIntersection(
      userPreferences.spendingCategories,
      card.spendingCategories
    )
    
    // Scoring components (total: 100 points)
    const maxRewards = Math.max(...eligible.map(c => c.rewardsRate), 1)
    const maxSignUp = Math.max(...eligible.map(c => c.signUpBonus), 1)
    const maxJoining = Math.max(...eligible.map(c => c.joiningFee), 1)
    const maxAnnual = Math.max(...eligible.map(c => c.annualFee), 1)
    
    // 1. Category Intersection (40 points)
    const intersectionScore = userPreferences.spendingCategories.length > 0
      ? (intersection.intersectionCount / userPreferences.spendingCategories.length) * 40
      : 0
    
    // 2. Rewards Rate (25 points)
    const rewardsScore = (card.rewardsRate / maxRewards) * 25
    
    // 3. Bank Preference Bonus (15 points)
    const bankBonus = userPreferences.preferredBanks.some(bank =>
      card.bank.toLowerCase().includes(bank.toLowerCase())
    ) ? 15 : 0
    
    // 4. Sign-up Bonus (10 points)
    const signupScore = (card.signUpBonus / maxSignUp) * 10
    
    // 5. Joining Fee (5 points) - Lower is better
    const joiningScore = maxJoining > 0
      ? ((maxJoining - card.joiningFee) / maxJoining) * 5
      : 5
    
    // 6. Annual Fee (5 points) - Lower is better
    const annualScore = maxAnnual > 0
      ? ((maxAnnual - card.annualFee) / maxAnnual) * 5
      : 5
    
    const totalScore = intersectionScore + rewardsScore + bankBonus +
                       signupScore + joiningScore + annualScore
    
    return {
      card,
      totalScore,
      scoreBreakdown: {
        intersectionScore,
        rewardsScore,
        bankBonus,
        signupScore,
        joiningScore,
        annualScore
      },
      intersectionDetails: intersection,
      eligible: true,
      eligibilityReasons: []
    }
  })
  
  // STEP 3: Filter by intersection
  const withIntersection = scored.filter(s => 
    s.intersectionDetails.intersectionCount > 0
  )
  
  console.log(`🎯 Cards with category match: ${withIntersection.length}`)
  
  // STEP 4: Sort and select top N
  const finalCandidates = withIntersection.length > 0 
    ? withIntersection 
    : scored
  
  const recommendations = finalCandidates
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, maxResults)
  
  return {
    recommendations,
    stats: {
      totalCards: cards.length,
      eligibleCount: eligible.length,
      withIntersection: withIntersection.length,
      preferredBankCards: recommendations.filter(r => r.scoreBreakdown.bankBonus > 0).length
    }
  }
}
\`\`\`

**Intersection Calculation**:

\`\`\`typescript
/**
 * Calculate intersection between user and card categories
 */
function calculateCategoryIntersection(
  userCategories: string[],
  cardCategories: string[]
) {
  const matchedCategories: string[] = []
  
  const normalizedUser = userCategories.map(c => c.toLowerCase().trim())
  const normalizedCard = cardCategories.map(c => c.toLowerCase().trim())
  
  for (const userCat of normalizedUser) {
    for (const cardCat of normalizedCard) {
      if (categoriesMatch(userCat, cardCat)) {
        matchedCategories.push(userCat)
        break  // Count each category once
      }
    }
  }
  
  return {
    intersectionCount: matchedCategories.length,
    matchedCategories,
    intersectionPercentage: userCategories.length > 0
      ? (matchedCategories.length / userCategories.length) * 100
      : 0
  }
}
\`\`\`

---

## 4. Algorithm 3: Refined Scoring

### 4.1 Purpose

Simplified scoring for **Card Tester** and quick lookups.

### 4.2 Implementation

\`\`\`typescript
/**
 * Refined Scoring Algorithm
 * 
 * Simplified 6-component scoring (max 105 with bank bonus)
 */
function calculateRefinedScore(
  card: CreditCard,
  userCategories: string[],
  preferredBanks: string[],
  maxValues: MaxValues
) {
  
  // 1. Rewards Rate (30 points)
  const rewardsScore = (card.rewardsRate / maxValues.rewards) * 30
  
  // 2. Category Match (30 points)
  const matchingCategories = card.spendingCategories.filter(cat =>
    userCategories.includes(cat)
  )
  const categoryScore = userCategories.length > 0
    ? (matchingCategories.length / userCategories.length) * 30
    : 0
  
  // 3. Sign-up Bonus (20 points)
  const signupScore = (card.signUpBonus / maxValues.signup) * 20
  
  // 4. Joining Fee (10 points) - Lower is better
  const joiningScore = ((maxValues.joining - card.joiningFee) / maxValues.joining) * 10
  
  // 5. Annual Fee (10 points) - Lower is better
  const annualScore = ((maxValues.annual - card.annualFee) / maxValues.annual) * 10
  
  // 6. Bank Bonus (5 points)
  const bankScore = preferredBanks.some(bank =>
    card.bank.toLowerCase().includes(bank.toLowerCase())
  ) ? 5 : 0
  
  const totalScore = rewardsScore + categoryScore + signupScore +
                     joiningScore + annualScore + bankScore
  
  return {
    total: totalScore,
    breakdown: {
      rewards: rewardsScore,
      category: categoryScore,
      signup: signupScore,
      joining: joiningScore,
      annual: annualScore,
      bank: bankScore
    },
    categoryMatches: matchingCategories
  }
}
\`\`\`

---

## 5. Category Matching System

### 5.1 Complete Synonym Table

\`\`\`typescript
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  // Food & Dining
  'dining': ['restaurant', 'food', 'eat', 'meal', 'cafe', 'dine'],
  'restaurant': ['dining', 'food', 'eat', 'meal', 'cafe'],
  'food': ['dining', 'restaurant', 'eat', 'meal', 'grocery'],
  
  // Travel & Hospitality
  'travel': ['hotel', 'flight', 'airline', 'booking', 'vacation', 'trip'],
  'hotel': ['travel', 'booking', 'accommodation', 'stay', 'resort'],
  'flight': ['travel', 'airline', 'air', 'aviation'],
  
  // Shopping
  'shopping': ['retail', 'store', 'purchase', 'buy', 'mall'],
  'online': ['internet', 'digital', 'e-commerce', 'web', 'online shopping'],
  'retail': ['shopping', 'store', 'purchase'],
  
  // Transportation
  'fuel': ['gas', 'petrol', 'gasoline', 'pump'],
  'gas': ['fuel', 'petrol', 'gasoline'],
  'transport': ['taxi', 'uber', 'ola', 'metro', 'bus', 'ride'],
  
  // Entertainment
  'entertainment': ['movie', 'cinema', 'streaming', 'show', 'netflix', 'theatre'],
  'movie': ['cinema', 'entertainment', 'theatre', 'film'],
  
  // Groceries
  'grocery': ['supermarket', 'food', 'groceries', 'market', 'vegetables'],
  
  // Utilities
  'utility': ['bill', 'electric', 'electricity', 'water', 'internet', 'phone'],
  'bill': ['utility', 'payment', 'recharge'],
  
  // Healthcare
  'healthcare': ['medical', 'hospital', 'doctor', 'pharmacy', 'health'],
  'medical': ['healthcare', 'hospital', 'doctor', 'pharmacy'],
  
  // Education
  'education': ['school', 'college', 'university', 'course', 'learning'],
  
  // Insurance
  'insurance': ['policy', 'premium', 'coverage'],
  
  // Telecom
  'mobile': ['phone', 'recharge', 'telecom'],
  'recharge': ['mobile', 'phone', 'prepaid']
}
\`\`\`

---

## 6. Two-Tier System

### 6.1 Decision Tree

\`\`\`
User Selected Brands?
│
├─ YES
│  │
│  └─ Filter Level 3 cards by selected brands
│     │
│     ├─ Found ≥7 cards?
│     │  │
│     │  ├─ YES → Score, rank, take top 7 → DONE (Preferred only)
│     │  │
│     │  └─ NO → Score, rank, take all (e.g., 3 cards)
│     │          │
│     │          └─ Fill remaining slots (7-3=4 needed)
│     │              │
│     │              └─ Filter Level 3 cards (exclude selected 3)
│     │                  │
│     │                  └─ Score, rank, take top 4
│     │                      │
│     │                      └─ Combine: 3 preferred + 4 general = 7
│     │                          │
│     │                          └─ showGeneralMessage = true
│
└─ NO
   │
   └─ Use all Level 3 cards
      │
      └─ Score, rank, take top 7
          │
          └─ DONE (General only)
\`\`\`

### 6.2 Message Logic

\`\`\`typescript
/**
 * Determine what message to show user
 */
function getTwoTierMessage(result: TwoTierResult): string {
  const { preferredBrandCards, generalCards, showGeneralMessage } = result
  
  if (preferredBrandCards.length === 0 && generalCards.length > 0) {
    return "Top recommendations based on your profile"
  }
  
  if (preferredBrandCards.length === 7 && generalCards.length === 0) {
    return "All recommendations are from your preferred brands"
  }
  
  if (showGeneralMessage && preferredBrandCards.length > 0) {
    return `Your selected brand${preferredBrandCards.length === 1 ? '' : 's'} have ${preferredBrandCards.length} matching card${preferredBrandCards.length === 1 ? '' : 's'}. Here are ${generalCards.length} additional card${generalCards.length === 1 ? '' : 's'} to complete your TOP 7 recommendations.`
  }
  
  return "Personalized recommendations for you"
}
\`\`\`

---

## 7. Testing Scenarios

### 7.1 Complete Test Cases

\`\`\`typescript
// Test Case 1: High Income, Excellent Credit, Multiple Categories
const testCase1 = {
  name: "Premium User",
  input: {
    monthlyIncome: 200000,
    creditScore: 800,
    spendingCategories: ['Travel', 'Dining', 'Shopping'],
    preferredBrands: ['American Express', 'HDFC'],
    joiningFeePreference: 'no_concern'
  },
  expectedBehavior: {
    level1Pass: "Almost all cards",
    level2Pass: "Cards with travel/dining/shopping",
    level3Pass: "All cards (no fee filter)",
    tier1: "Amex + HDFC cards (likely 7+)",
    tier2: "Not needed if tier1 ≥ 7",
    finalCount: 7,
    topCard: "Premium travel/dining card"
  }
}

// Test Case 2: Medium Income, Good Credit, Specific Category
const testCase2 = {
  name: "Cashback Seeker",
  input: {
    monthlyIncome: 50000,
    creditScore: 700,
    spendingCategories: ['Online Shopping', 'Grocery'],
    preferredBrands: [],
    joiningFeePreference: 'no_fee'
  },
  expectedBehavior: {
    level1Pass: "Mid-tier cards",
    level2Pass: "Shopping/grocery focused",
    level3Pass: "Only free cards",
    tier1: "None (no brands selected)",
    tier2: "All from general pool",
    finalCount: 7,
    topCard: "Online shopping cashback card"
  }
}

// Test Case 3: Low Income, Fair Credit, Single Category
const testCase3 = {
  name: "First-Time User",
  input: {
    monthlyIncome: 25000,
    creditScore: 620,
    spendingCategories: ['Fuel'],
    preferredBrands: ['SBI'],
    joiningFeePreference: 'no_fee'
  },
  expectedBehavior: {
    level1Pass: "Entry-level cards only",
    level2Pass: "Fuel-focused cards",
    level3Pass: "Free cards only",
    tier1: "SBI fuel cards (if any)",
    tier2: "Other fuel cards to fill",
    finalCount: "2-4 (limited options)",
    topCard: "SBI fuel card"
  }
}

// Test Case 4: Edge Case - No Categories
const testCase4 = {
  name: "No Categories Selected",
  input: {
    monthlyIncome: 100000,
    creditScore: 750,
    spendingCategories: [],
    preferredBrands: ['HDFC'],
    joiningFeePreference: 'low_fee'
  },
  expectedBehavior: {
    level1Pass: "Most cards",
    level2Pass: "All (no category filter)",
    level3Pass: "Fee ≤ ₹1000",
    tier1: "HDFC cards with low fee",
    tier2: "Other cards if needed",
    finalCount: 7,
    topCard: "HDFC card with best rewards"
  }
}

// Test Case 5: Edge Case - No Matching Cards
const testCase5 = {
  name: "Very Restrictive Criteria",
  input: {
    monthlyIncome: 20000,
    creditScore: 550,
    spendingCategories: ['Luxury', 'Private Jet'],
    preferredBrands: ['American Express'],
    joiningFeePreference: 'no_fee'
  },
  expectedBehavior: {
    level1Pass: "Very few basic cards",
    level2Pass: "None (luxury not matched)",
    level3Pass: "None",
    tier1: "None",
    tier2: "None",
    finalCount: 0,
    message: "No cards match your criteria. Try adjusting filters."
  }
}
\`\`\`

### 7.2 Validation Tests

\`\`\`typescript
/**
 * Run validation tests on the algorithm
 */
function validateAlgorithm() {
  
  // Test 1: Score bounds
  assert(score >= 0 && score <= 100, "Score out of bounds")
  
  // Test 2: 7-card limit
  assert(recommendations.length <= 7, "Exceeded 7-card limit")
  
  // Test 3: No duplicates
  const ids = recommendations.map(r => r.card.id)
  assert(ids.length === new Set(ids).size, "Duplicate cards found")
  
  // Test 4: Tier separation
  const tier1Ids = tier1Cards.map(c => c.card.id)
  const tier2Ids = tier2Cards.map(c => c.card.id)
  const overlap = tier1Ids.filter(id => tier2Ids.includes(id))
  assert(overlap.length === 0, "Cards appear in both tiers")
  
  // Test 5: Sorting order
  for (let i = 0; i < recommendations.length - 1; i++) {
    assert(
      recommendations[i].score >= recommendations[i+1].score,
      "Recommendations not sorted by score"
    )
  }
  
  console.log("✅ All validation tests passed")
}
\`\`\`

---

## Appendix: Quick Reference

### Algorithm Selection Guide

\`\`\`
Choose Algorithm Based On:

┌─────────────────────────────────────────┐
│ Full Profile + Brand Preference        │
│ → Funnel-Based Engine                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Category-Focused Shopping               │
│ → Adaptive Intersection                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Quick Card Testing/Lookup               │
│ → Refined Scoring                       │
└─────────────────────────────────────────┘
\`\`\`

### Scoring Weights Summary

| Algorithm | Category | Rewards | Brand | Sign-up | Fees |
|-----------|----------|---------|-------|---------|------|
| Funnel | 30% | 20-60% | 0-50% | 0-10% | - |
| Adaptive | 40% | 25% | 15% | 10% | 10% |
| Refined | 30% | 30% | 5% | 20% | 20% |

---

**END OF SPECIFICATION**
