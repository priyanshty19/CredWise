# CredWise

## 🧠 Credit Card Recommendation Engine

This repository contains a **funnel-based, explainable credit card recommendation engine** with a two-tier ranking system.  
The engine recommends **up to 7 credit cards** that best match a user’s eligibility, spending behavior, fee preference, and brand affinity.

---

## 🎯 Recommendation Philosophy

The system follows a strict sequence:

1. **Eligibility first** – Can the user get approved?
2. **Relevance next** – Does the card match spending behavior?
3. **User preference** – Fee sensitivity & brand trust
4. **Scoring & ranking** – Explainable weighted scoring
5. **Top 7 output** – Never overwhelming, always relevant

This avoids black-box ML and ensures deterministic, debuggable recommendations.

---

## 🔄 High-Level Flow

The recommendation engine processes data in a linear funnel:

User Profile → Eligibility → Relevance → Preference → Scoring → Top 7 Output

---

## 🧩 Funnel Stages Explained

### ✅ Level 1 – Basic Eligibility
**Question:** _Can this user realistically get approved for the card?_

**Database fields used**
- `Income Requirement`
- `Credit Score Requirement`

Cards failing this stage are permanently removed.

---

### 🎯 Level 2 – Category Relevance
**Question:** _Does the card reward how the user actually spends?_

**Database fields used**
- `Best For Categories`
- `Spending Category`

Cards must achieve **greater than 65% category match** to pass.

---

### 💸 Level 3 – Joining Fee Preference
**Question:** _Is the upfront joining fee acceptable to the user?_

**Database field used**
- `Joining Fee`

Rules:
- `no_fee` → only ₹0 joining fee cards
- `low_fee` → joining fee ≤ ₹1000
- `no_concern` → no restriction

---

## 🏷️ Two-Tier Recommendation System

### Tier 1 – Preferred Brand Cards
If the user selects preferred banks:
- Cards from those banks are ranked first

### Tier 2 – General Cards
If Tier 1 has fewer than 7 cards:
- Best alternatives from other banks are added

This prevents empty results and over-filtering.

---

## 🧮 Scoring & Ranking (Explainable)

Each remaining card is scored using weighted signals.

| Signal | Weight | Database Fields |
|------|--------|----------------|
| Category Match | 30% | Best For Categories, Spending Category |
| Rewards Rate | 20–60% | Base Reward Rate, Optimized Reward Rate |
| Brand Match | up to 50% | Bank |
| Sign-Up Bonus | up to 10% | Sign Up Bonus |

Scores are normalized and cards are ranked in descending order.

---

## 🚀 How It Works in Code

The engine is executed by passing:
- A list of credit cards from the database
- A normalized user profile

Main entry point:

FunnelRecommendationEngine.processFunnel(allCards, userProfile)

The function returns:
- Filtered cards at each funnel level
- Final ranked recommendations
- Funnel statistics for analytics/debugging

---

## 🧾 Explainability

Each recommendation includes a human-readable explanation, for example:

> “Selected from Preferred Brand Tier based on 82% category match, 5% rewards rate, no joining fee.”

This builds trust and makes the system fully debuggable.

---

## 📊 Database Field Usage Summary

| Database Field | Usage |
|--------------|------|
| Card Name | Display |
| Bank | Brand filtering & brand score |
| Card Type | UI / future logic |
| Joining Fee | Level 3 filtering & reasoning |
| Annual Fee | Reserved for future penalization |
| Credit Score Requirement | Level 1 eligibility |
| Income Requirement | Level 1 eligibility |
| Base Reward Rate | Reward scoring |
| Optimized Reward Rate | Preferred reward scoring |
| Reward Type | Context / UI |
| Best For Categories | Category matching |
| Min Annual Spend | Future milestone logic |
| Milestone Dependency | Future reward realism |
| Sign Up Bonus | Scoring |
| Features | UI bullets |
| Spending Category | Category matching |

---

## ⚠️ Assumptions & Constraints

- Reward rates are normalized before scoring
- Category matching is fuzzy and keyword-based
- Scores are relative within a recommendation set
- Maximum of 7 cards are always returned
- Engine is deterministic (same input → same output)


--- 


## 🔮 Future Enhancements

- Penalize high annual fee cards
- Reward milestone-achievable cards
- Add “Why this card was not recommended”
- Introduce tunable scoring weights




---

## 📐 Mermaid Flow Diagram

```mermaid
flowchart TD
    U[User Profile] --> C[All Credit Cards]

    C --> L1[Level 1: Eligibility<br/>Income + Credit Score]
    L1 --> L2[Level 2: Category Match<br/>> 65% Required]
    L2 --> L3[Level 3: Joining Fee Preference]

    L3 --> T{Preferred Brands?}

    T -->|Yes| P1[Preferred Brand Cards]
    P1 --> S1[Score & Rank]
    S1 --> TOP7[Final Top 7]

    T -->|No| G1[General Cards]
    G1 --> S2[Score & Rank]
    S2 --> TOP7

    TOP7 --> O[Recommendations + Reasoning]

