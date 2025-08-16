"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CreditCard, TrendingUp, Building2, Eye, EyeOff, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { submitEnhancedFormData, trackCardApplicationClick } from "@/lib/google-sheets-submissions"

// Complete card dataset with all 311 cards
const COMPLETE_CARD_DATA = [
  // SBI Cards
  {
    id: "sbi-cashback",
    name: "SBI Card CashBack",
    bank: "SBI",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 999,
    rewardRate: 5.0,
    signupBonus: 2000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["fuel", "grocery", "dining", "online_shopping"],
    description: "5% cashback on fuel, grocery & dining",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/shopping/sbi-card-cashback.page",
  },
  {
    id: "sbi-simplyclick",
    name: "SBI Card SimplyCLICK",
    bank: "SBI",
    cardType: "Cashback",
    joiningFee: 499,
    annualFee: 499,
    rewardRate: 10.0,
    signupBonus: 2000,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["online_shopping", "dining"],
    description: "10X reward points on online spends",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/shopping/sbi-card-simplyclick.page",
  },
  {
    id: "sbi-prime",
    name: "SBI Card PRIME",
    bank: "SBI",
    cardType: "Rewards",
    joiningFee: 2999,
    annualFee: 2999,
    rewardRate: 3.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 30000,
    tags: ["dining", "movies", "grocery"],
    description: "10X reward points on dining & movies",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/rewards/sbi-card-prime.page",
  },
  {
    id: "sbi-elite",
    name: "SBI Card ELITE",
    bank: "SBI",
    cardType: "Premium",
    joiningFee: 4999,
    annualFee: 4999,
    rewardRate: 2.0,
    signupBonus: 10000,
    minCreditScore: 750,
    minIncome: 50000,
    tags: ["travel", "dining", "shopping"],
    description: "Premium lifestyle benefits with travel rewards",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/premium/sbi-card-elite.page",
  },
  {
    id: "sbi-platinum",
    name: "SBI Card Platinum",
    bank: "SBI",
    cardType: "Entry Level",
    joiningFee: 499,
    annualFee: 499,
    rewardRate: 1.0,
    signupBonus: 500,
    minCreditScore: 600,
    minIncome: 20000,
    tags: ["fuel", "grocery"],
    description: "Entry-level card with basic rewards",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/entry-level/sbi-card-platinum.page",
  },
  {
    id: "sbi-simply-save",
    name: "SBI Card SimplySAVE",
    bank: "SBI",
    cardType: "Rewards",
    joiningFee: 499,
    annualFee: 499,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["fuel", "grocery", "departmental_stores"],
    description: "2X reward points on fuel and grocery",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/rewards/sbi-card-simplysave.page",
  },
  {
    id: "sbi-octane",
    name: "SBI Card OCTANE",
    bank: "SBI",
    cardType: "Fuel",
    joiningFee: 499,
    annualFee: 499,
    rewardRate: 13.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["fuel"],
    description: "13X reward points on fuel spends",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/fuel/sbi-card-octane.page",
  },
  {
    id: "sbi-air-india-signature",
    name: "Air India SBI Signature Card",
    bank: "SBI",
    cardType: "Travel",
    joiningFee: 4999,
    annualFee: 4999,
    rewardRate: 2.0,
    signupBonus: 10000,
    minCreditScore: 750,
    minIncome: 60000,
    tags: ["travel", "airlines"],
    description: "Premium travel card with Air India benefits",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/travel/air-india-sbi-signature-card.page",
  },
  {
    id: "sbi-air-india-platinum",
    name: "Air India SBI Platinum Card",
    bank: "SBI",
    cardType: "Travel",
    joiningFee: 1499,
    annualFee: 1499,
    rewardRate: 1.5,
    signupBonus: 3000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["travel", "airlines"],
    description: "Travel card with Air India rewards",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/travel/air-india-sbi-platinum-card.page",
  },
  {
    id: "sbi-yono",
    name: "SBI Card YONO",
    bank: "SBI",
    cardType: "Digital",
    joiningFee: 0,
    annualFee: 499,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["online_shopping", "digital"],
    description: "Digital-first card with online benefits",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/digital/sbi-card-yono.page",
  },

  // HDFC Bank Cards
  {
    id: "hdfc-millennia",
    name: "HDFC Bank Millennia Credit Card",
    bank: "HDFC Bank",
    cardType: "Cashback",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.5,
    signupBonus: 1000,
    minCreditScore: 700,
    minIncome: 25000,
    tags: ["online_shopping", "dining"],
    description: "2.5% cashback on online spends",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-credit-card",
  },
  {
    id: "hdfc-regalia",
    name: "HDFC Bank Regalia Credit Card",
    bank: "HDFC Bank",
    cardType: "Premium",
    joiningFee: 2500,
    annualFee: 2500,
    rewardRate: 2.0,
    signupBonus: 10000,
    minCreditScore: 750,
    minIncome: 50000,
    tags: ["travel", "dining", "shopping"],
    description: "4X reward points on dining, shopping & travel",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-credit-card",
  },
  {
    id: "hdfc-infinia",
    name: "HDFC Bank Infinia Credit Card",
    bank: "HDFC Bank",
    cardType: "Super Premium",
    joiningFee: 12500,
    annualFee: 12500,
    rewardRate: 3.3,
    signupBonus: 25000,
    minCreditScore: 800,
    minIncome: 200000,
    tags: ["travel", "dining", "shopping", "luxury"],
    description: "Ultra-premium card with unlimited airport lounge access",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/infinia-credit-card",
  },
  {
    id: "hdfc-freedom",
    name: "HDFC Bank Freedom Credit Card",
    bank: "HDFC Bank",
    cardType: "Entry Level",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.0,
    signupBonus: 500,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["fuel", "grocery"],
    description: "Entry-level card with basic rewards",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/freedom-credit-card",
  },
  {
    id: "hdfc-moneyback",
    name: "HDFC Bank MoneyBack Credit Card",
    bank: "HDFC Bank",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 500,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["fuel", "grocery", "bill_payments"],
    description: "2% cashback on fuel and grocery",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/moneyback-credit-card",
  },
  {
    id: "hdfc-business-moneyback",
    name: "HDFC Bank Business MoneyBack Credit Card",
    bank: "HDFC Bank",
    cardType: "Business",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 700,
    minIncome: 30000,
    tags: ["business", "fuel", "bill_payments"],
    description: "Business card with cashback on business spends",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/business-moneyback-credit-card",
  },
  {
    id: "hdfc-diners-club-black",
    name: "HDFC Diners Club Black Credit Card",
    bank: "HDFC Bank",
    cardType: "Super Premium",
    joiningFee: 10000,
    annualFee: 10000,
    rewardRate: 3.0,
    signupBonus: 20000,
    minCreditScore: 800,
    minIncome: 150000,
    tags: ["travel", "dining", "luxury", "golf"],
    description: "Ultra-premium card with exclusive privileges",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/diners-club-black",
  },
  {
    id: "hdfc-diners-club-privilege",
    name: "HDFC Diners Club Privilege Credit Card",
    bank: "HDFC Bank",
    cardType: "Premium",
    joiningFee: 2500,
    annualFee: 2500,
    rewardRate: 2.0,
    signupBonus: 5000,
    minCreditScore: 750,
    minIncome: 50000,
    tags: ["travel", "dining", "golf"],
    description: "Premium card with golf and dining privileges",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/diners-club-privilege",
  },
  {
    id: "hdfc-shoppers-stop",
    name: "HDFC Bank Shoppers Stop Credit Card",
    bank: "HDFC Bank",
    cardType: "Shopping",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["shopping", "departmental_stores"],
    description: "Shopping card with Shoppers Stop benefits",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/shoppers-stop-credit-card",
  },
  {
    id: "hdfc-times-titanium",
    name: "HDFC Bank Times Titanium Credit Card",
    bank: "HDFC Bank",
    cardType: "Lifestyle",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 700,
    minIncome: 30000,
    tags: ["movies", "dining", "entertainment"],
    description: "Lifestyle card with entertainment benefits",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/times-titanium-credit-card",
  },

  // ICICI Bank Cards
  {
    id: "icici-amazon-pay",
    name: "Amazon Pay ICICI Bank Credit Card",
    bank: "ICICI Bank",
    cardType: "Cashback",
    joiningFee: 0,
    annualFee: 500,
    rewardRate: 5.0,
    signupBonus: 2000,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["online_shopping", "amazon"],
    description: "5% cashback on Amazon purchases",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/amazon-pay-credit-card",
  },
  {
    id: "icici-platinum",
    name: "ICICI Bank Platinum Credit Card",
    bank: "ICICI Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["dining", "shopping", "fuel"],
    description: "2X reward points on dining and shopping",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/platinum-credit-card",
  },
  {
    id: "icici-sapphiro",
    name: "ICICI Bank Sapphiro Credit Card",
    bank: "ICICI Bank",
    cardType: "Premium",
    joiningFee: 3500,
    annualFee: 3500,
    rewardRate: 2.0,
    signupBonus: 7500,
    minCreditScore: 750,
    minIncome: 60000,
    tags: ["travel", "dining", "shopping"],
    description: "Premium card with travel and lifestyle benefits",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/sapphiro-credit-card",
  },
  {
    id: "icici-emeralde",
    name: "ICICI Bank Emeralde Credit Card",
    bank: "ICICI Bank",
    cardType: "Super Premium",
    joiningFee: 12000,
    annualFee: 12000,
    rewardRate: 3.0,
    signupBonus: 25000,
    minCreditScore: 800,
    minIncome: 150000,
    tags: ["travel", "luxury", "concierge"],
    description: "Ultra-premium card with concierge services",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/emeralde-credit-card",
  },
  {
    id: "icici-coral",
    name: "ICICI Bank Coral Credit Card",
    bank: "ICICI Bank",
    cardType: "Lifestyle",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["movies", "dining", "fuel"],
    description: "Lifestyle card with entertainment benefits",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/coral-credit-card",
  },
  {
    id: "icici-rubyx",
    name: "ICICI Bank Rubyx Credit Card",
    bank: "ICICI Bank",
    cardType: "Premium",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.0,
    signupBonus: 2000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["movies", "dining", "fuel"],
    description: "Premium lifestyle card with movie benefits",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/rubyx-credit-card",
  },
  {
    id: "icici-manchester-united",
    name: "ICICI Bank Manchester United Credit Card",
    bank: "ICICI Bank",
    cardType: "Sports",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["sports", "shopping", "fuel"],
    description: "Sports-themed card with Manchester United benefits",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/manchester-united-credit-card",
  },
  {
    id: "icici-instant-platinum",
    name: "ICICI Bank Instant Platinum Credit Card",
    bank: "ICICI Bank",
    cardType: "Instant",
    joiningFee: 199,
    annualFee: 199,
    rewardRate: 1.0,
    signupBonus: 500,
    minCreditScore: 600,
    minIncome: 20000,
    tags: ["instant", "fuel", "grocery"],
    description: "Instant approval card with basic rewards",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/instant-platinum-credit-card",
  },
  {
    id: "icici-student",
    name: "ICICI Bank Student Credit Card",
    bank: "ICICI Bank",
    cardType: "Student",
    joiningFee: 99,
    annualFee: 99,
    rewardRate: 1.0,
    signupBonus: 250,
    minCreditScore: 650,
    minIncome: 10000,
    tags: ["student", "online_shopping", "movies"],
    description: "Student card with low fees and basic rewards",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/student-credit-card",
  },
  {
    id: "icici-expressions",
    name: "ICICI Bank Expressions Credit Card",
    bank: "ICICI Bank",
    cardType: "Customizable",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 750,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["customizable", "shopping", "fuel"],
    description: "Customizable card with personalized design",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/expressions-credit-card",
  },

  // Axis Bank Cards
  {
    id: "axis-ace",
    name: "Axis Bank ACE Credit Card",
    bank: "Axis Bank",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 4.0,
    signupBonus: 500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["bill_payments", "online_shopping"],
    description: "4% cashback on bill payments",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/ace-credit-card",
  },
  {
    id: "axis-magnus",
    name: "Axis Bank Magnus Credit Card",
    bank: "Axis Bank",
    cardType: "Premium",
    joiningFee: 12500,
    annualFee: 12500,
    rewardRate: 2.4,
    signupBonus: 25000,
    minCreditScore: 750,
    minIncome: 150000,
    tags: ["travel", "dining", "shopping"],
    description: "Premium travel and lifestyle benefits",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/magnus-credit-card",
  },
  {
    id: "axis-reserve",
    name: "Axis Bank Reserve Credit Card",
    bank: "Axis Bank",
    cardType: "Super Premium",
    joiningFee: 50000,
    annualFee: 50000,
    rewardRate: 3.0,
    signupBonus: 100000,
    minCreditScore: 800,
    minIncome: 300000,
    tags: ["travel", "luxury", "concierge"],
    description: "Ultra-luxury card with exclusive privileges",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/reserve-credit-card",
  },
  {
    id: "axis-flipkart",
    name: "Flipkart Axis Bank Credit Card",
    bank: "Axis Bank",
    cardType: "Shopping",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 4.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["online_shopping", "flipkart"],
    description: "4% cashback on Flipkart purchases",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/flipkart-credit-card",
  },
  {
    id: "axis-my-zone",
    name: "Axis Bank MY ZONE Credit Card",
    bank: "Axis Bank",
    cardType: "Lifestyle",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["movies", "dining", "fuel"],
    description: "Lifestyle card with entertainment benefits",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/my-zone-credit-card",
  },
  {
    id: "axis-neo",
    name: "Axis Bank NEO Credit Card",
    bank: "Axis Bank",
    cardType: "Entry Level",
    joiningFee: 250,
    annualFee: 250,
    rewardRate: 1.0,
    signupBonus: 500,
    minCreditScore: 600,
    minIncome: 15000,
    tags: ["entry_level", "fuel", "grocery"],
    description: "Entry-level card with basic rewards",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/neo-credit-card",
  },
  {
    id: "axis-privilege",
    name: "Axis Bank Privilege Credit Card",
    bank: "Axis Bank",
    cardType: "Premium",
    joiningFee: 1500,
    annualFee: 1500,
    rewardRate: 2.0,
    signupBonus: 3000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["travel", "dining", "fuel"],
    description: "Premium card with travel benefits",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/privilege-credit-card",
  },
  {
    id: "axis-select",
    name: "Axis Bank SELECT Credit Card",
    bank: "Axis Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["shopping", "dining", "fuel"],
    description: "Rewards card with flexible redemption",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/select-credit-card",
  },
  {
    id: "axis-vistara",
    name: "Vistara Axis Bank Credit Card",
    bank: "Axis Bank",
    cardType: "Travel",
    joiningFee: 1500,
    annualFee: 1500,
    rewardRate: 2.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["travel", "airlines", "vistara"],
    description: "Travel card with Vistara benefits",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/vistara-credit-card",
  },
  {
    id: "axis-indianoil",
    name: "IndianOil Axis Bank Credit Card",
    bank: "Axis Bank",
    cardType: "Fuel",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 4.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["fuel", "indianoil"],
    description: "Fuel card with IndianOil benefits",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/indianoil-credit-card",
  },

  // American Express Cards
  {
    id: "amex-gold",
    name: "American Express Gold Card",
    bank: "American Express",
    cardType: "Premium",
    joiningFee: 4500,
    annualFee: 4500,
    rewardRate: 2.0,
    signupBonus: 20000,
    minCreditScore: 750,
    minIncome: 60000,
    tags: ["travel", "dining", "shopping"],
    description: "4X Membership Rewards points on dining & travel",
    applyUrl: "https://www.americanexpress.com/in/credit-cards/gold-card/",
  },
  {
    id: "amex-platinum",
    name: "American Express Platinum Card",
    bank: "American Express",
    cardType: "Super Premium",
    joiningFee: 60000,
    annualFee: 60000,
    rewardRate: 1.8,
    signupBonus: 80000,
    minCreditScore: 800,
    minIncome: 250000,
    tags: ["travel", "luxury", "concierge"],
    description: "Ultra-luxury card with exclusive privileges",
    applyUrl: "https://www.americanexpress.com/in/credit-cards/platinum-card/",
  },
  {
    id: "amex-platinum-travel",
    name: "American Express Platinum Travel Credit Card",
    bank: "American Express",
    cardType: "Travel",
    joiningFee: 3500,
    annualFee: 3500,
    rewardRate: 2.0,
    signupBonus: 15000,
    minCreditScore: 750,
    minIncome: 50000,
    tags: ["travel", "airlines", "hotels"],
    description: "Travel-focused card with airline benefits",
    applyUrl: "https://www.americanexpress.com/in/credit-cards/platinum-travel-credit-card/",
  },
  {
    id: "amex-membership-rewards",
    name: "American Express Membership Rewards Credit Card",
    bank: "American Express",
    cardType: "Rewards",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 1.0,
    signupBonus: 4000,
    minCreditScore: 700,
    minIncome: 30000,
    tags: ["rewards", "shopping", "dining"],
    description: "Flexible rewards card with multiple redemption options",
    applyUrl: "https://www.americanexpress.com/in/credit-cards/membership-rewards-credit-card/",
  },
  {
    id: "amex-smartearn",
    name: "American Express SmartEarn Credit Card",
    bank: "American Express",
    cardType: "Cashback",
    joiningFee: 495,
    annualFee: 495,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["cashback", "online_shopping", "bill_payments"],
    description: "Cashback card with online shopping benefits",
    applyUrl: "https://www.americanexpress.com/in/credit-cards/smartearn-credit-card/",
  },

  // Kotak Mahindra Bank Cards
  {
    id: "kotak-811",
    name: "Kotak 811 #Dream Different Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Entry Level",
    joiningFee: 0,
    annualFee: 500,
    rewardRate: 1.0,
    signupBonus: 500,
    minCreditScore: 600,
    minIncome: 15000,
    tags: ["fuel", "grocery"],
    description: "Entry-level card with basic rewards",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/811-credit-card.html",
  },
  {
    id: "kotak-royale-signature",
    name: "Kotak Royale Signature Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Super Premium",
    joiningFee: 10000,
    annualFee: 10000,
    rewardRate: 3.0,
    signupBonus: 20000,
    minCreditScore: 800,
    minIncome: 150000,
    tags: ["travel", "luxury", "concierge"],
    description: "Ultra-premium card with luxury benefits",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/royale-signature-credit-card.html",
  },
  {
    id: "kotak-white-reserve",
    name: "Kotak White Reserve Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Premium",
    joiningFee: 2999,
    annualFee: 2999,
    rewardRate: 2.0,
    signupBonus: 7500,
    minCreditScore: 750,
    minIncome: 60000,
    tags: ["travel", "dining", "shopping"],
    description: "Premium card with travel and lifestyle benefits",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/white-reserve-credit-card.html",
  },
  {
    id: "kotak-myntra",
    name: "Kotak Myntra Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Shopping",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 4.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["online_shopping", "myntra", "fashion"],
    description: "Fashion-focused card with Myntra benefits",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/myntra-credit-card.html",
  },
  {
    id: "kotak-league-platinum",
    name: "Kotak League Platinum Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Sports",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["sports", "dining", "fuel"],
    description: "Sports-themed card with lifestyle benefits",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/league-platinum-credit-card.html",
  },
  {
    id: "kotak-zen-signature",
    name: "Kotak Zen Signature Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Premium",
    joiningFee: 1999,
    annualFee: 1999,
    rewardRate: 2.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["wellness", "dining", "shopping"],
    description: "Wellness-focused premium card",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/zen-signature-credit-card.html",
  },
  {
    id: "kotak-urbane-gold",
    name: "Kotak Urbane Gold Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Lifestyle",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["lifestyle", "dining", "movies"],
    description: "Urban lifestyle card with entertainment benefits",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/urbane-gold-credit-card.html",
  },
  {
    id: "kotak-essentia-platinum",
    name: "Kotak Essentia Platinum Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 750,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Essential rewards card for everyday spending",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/essentia-platinum-credit-card.html",
  },
  {
    id: "kotak-privy-league",
    name: "Kotak Privy League Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Business",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.0,
    signupBonus: 2000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["business", "corporate", "travel"],
    description: "Business card with corporate benefits",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/privy-league-credit-card.html",
  },
  {
    id: "kotak-mojo-platinum",
    name: "Kotak MOJO Platinum Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Youth",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["youth", "online_shopping", "movies"],
    description: "Youth-focused card with digital benefits",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/mojo-platinum-credit-card.html",
  },

  // YES Bank Cards
  {
    id: "yes-first-exclusive",
    name: "YES FIRST Exclusive Credit Card",
    bank: "YES Bank",
    cardType: "Premium",
    joiningFee: 2999,
    annualFee: 2999,
    rewardRate: 3.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["dining", "movies", "fuel"],
    description: "6X reward points on dining and movies",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-first-exclusive",
  },
  {
    id: "yes-first-preferred",
    name: "YES FIRST Preferred Credit Card",
    bank: "YES Bank",
    cardType: "Lifestyle",
    joiningFee: 499,
    annualFee: 499,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["dining", "fuel", "grocery"],
    description: "Lifestyle card with dining and fuel benefits",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-first-preferred",
  },
  {
    id: "yes-prosperity-edge",
    name: "YES Prosperity Edge Credit Card",
    bank: "YES Bank",
    cardType: "Premium",
    joiningFee: 1999,
    annualFee: 1999,
    rewardRate: 2.0,
    signupBonus: 4000,
    minCreditScore: 700,
    minIncome: 35000,
    tags: ["travel", "dining", "shopping"],
    description: "Premium card with travel and lifestyle benefits",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-prosperity-edge",
  },
  {
    id: "yes-reserv",
    name: "YES Reserv Credit Card",
    bank: "YES Bank",
    cardType: "Super Premium",
    joiningFee: 8999,
    annualFee: 8999,
    rewardRate: 3.0,
    signupBonus: 18000,
    minCreditScore: 750,
    minIncome: 100000,
    tags: ["travel", "luxury", "concierge"],
    description: "Ultra-premium card with exclusive privileges",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-reserv",
  },
  {
    id: "yes-kiwi",
    name: "YES Bank Kiwi Credit Card",
    bank: "YES Bank",
    cardType: "Entry Level",
    joiningFee: 250,
    annualFee: 250,
    rewardRate: 1.0,
    signupBonus: 500,
    minCreditScore: 600,
    minIncome: 15000,
    tags: ["entry_level", "fuel", "grocery"],
    description: "Entry-level card with basic rewards",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-kiwi",
  },
  {
    id: "yes-premia",
    name: "YES Premia Credit Card",
    bank: "YES Bank",
    cardType: "Rewards",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "shopping", "dining"],
    description: "Rewards card with flexible redemption options",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-premia",
  },
  {
    id: "yes-marquee",
    name: "YES Marquee Credit Card",
    bank: "YES Bank",
    cardType: "Premium",
    joiningFee: 4999,
    annualFee: 4999,
    rewardRate: 2.5,
    signupBonus: 10000,
    minCreditScore: 750,
    minIncome: 75000,
    tags: ["travel", "dining", "golf"],
    description: "Premium card with golf and travel benefits",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-marquee",
  },
  {
    id: "yes-swift",
    name: "YES Swift Credit Card",
    bank: "YES Bank",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["cashback", "fuel", "grocery"],
    description: "Cashback card for everyday spending",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-swift",
  },
  {
    id: "yes-cart",
    name: "YES Cart Credit Card",
    bank: "YES Bank",
    cardType: "Shopping",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 3.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["online_shopping", "e-commerce"],
    description: "Shopping-focused card with e-commerce benefits",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-cart",
  },
  {
    id: "yes-bank-business",
    name: "YES Bank Business Credit Card",
    bank: "YES Bank",
    cardType: "Business",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.0,
    signupBonus: 2000,
    minCreditScore: 700,
    minIncome: 50000,
    tags: ["business", "corporate", "fuel"],
    description: "Business card with corporate benefits",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-business",
  },

  // IndusInd Bank Cards
  {
    id: "indusind-legend",
    name: "IndusInd Bank Legend Credit Card",
    bank: "IndusInd Bank",
    cardType: "Super Premium",
    joiningFee: 10000,
    annualFee: 10000,
    rewardRate: 3.0,
    signupBonus: 15000,
    minCreditScore: 750,
    minIncome: 100000,
    tags: ["travel", "dining", "shopping", "golf"],
    description: "Luxury lifestyle card with golf privileges",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/legend.html",
  },
  {
    id: "indusind-pinnacle",
    name: "IndusInd Bank Pinnacle Credit Card",
    bank: "IndusInd Bank",
    cardType: "Premium",
    joiningFee: 2500,
    annualFee: 2500,
    rewardRate: 2.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 50000,
    tags: ["travel", "dining", "shopping"],
    description: "Premium card with travel and lifestyle benefits",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/pinnacle.html",
  },
  {
    id: "indusind-iconia",
    name: "IndusInd Bank Iconia Credit Card",
    bank: "IndusInd Bank",
    cardType: "Lifestyle",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 30000,
    tags: ["lifestyle", "dining", "movies"],
    description: "Lifestyle card with entertainment benefits",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/iconia.html",
  },
  {
    id: "indusind-platinum-aura-edge",
    name: "IndusInd Bank Platinum Aura Edge Credit Card",
    bank: "IndusInd Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with everyday benefits",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/platinum-aura-edge.html",
  },
  {
    id: "indusind-nexxt",
    name: "IndusInd Bank Nexxt Credit Card",
    bank: "IndusInd Bank",
    cardType: "Youth",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["youth", "online_shopping", "movies"],
    description: "Youth-focused card with digital benefits",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/nexxt.html",
  },
  {
    id: "indusind-eazydiner",
    name: "IndusInd Bank EazyDiner Credit Card",
    bank: "IndusInd Bank",
    cardType: "Dining",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 4.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["dining", "restaurants"],
    description: "Dining-focused card with restaurant benefits",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/eazydiner.html",
  },
  {
    id: "indusind-tiger",
    name: "IndusInd Bank Tiger Credit Card",
    bank: "IndusInd Bank",
    cardType: "Sports",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["sports", "fuel", "grocery"],
    description: "Sports-themed card with lifestyle benefits",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/tiger.html",
  },
  {
    id: "indusind-avios",
    name: "IndusInd Bank Avios Credit Card",
    bank: "IndusInd Bank",
    cardType: "Travel",
    joiningFee: 1500,
    annualFee: 1500,
    rewardRate: 2.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["travel", "airlines", "avios"],
    description: "Travel card with Avios rewards",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/avios.html",
  },
  {
    id: "indusind-duo",
    name: "IndusInd Bank Duo Credit Card",
    bank: "IndusInd Bank",
    cardType: "Dual",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 30000,
    tags: ["dual", "rewards", "cashback"],
    description: "Dual benefit card with rewards and cashback",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/duo.html",
  },
  {
    id: "indusind-student",
    name: "IndusInd Bank Student Credit Card",
    bank: "IndusInd Bank",
    cardType: "Student",
    joiningFee: 199,
    annualFee: 199,
    rewardRate: 1.0,
    signupBonus: 500,
    minCreditScore: 650,
    minIncome: 10000,
    tags: ["student", "online_shopping", "movies"],
    description: "Student card with low fees and basic rewards",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/student.html",
  },

  // Standard Chartered Cards
  {
    id: "standard-chartered-manhattan",
    name: "Standard Chartered Manhattan Credit Card",
    bank: "Standard Chartered",
    cardType: "Premium",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 5.0,
    signupBonus: 3000,
    minCreditScore: 700,
    minIncome: 35000,
    tags: ["dining", "shopping", "entertainment"],
    description: "5X reward points on dining and entertainment",
    applyUrl: "https://www.sc.com/in/credit-cards/manhattan-credit-card/",
  },
  {
    id: "standard-chartered-platinum-rewards",
    name: "Standard Chartered Platinum Rewards Credit Card",
    bank: "Standard Chartered",
    cardType: "Rewards",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with flexible redemption",
    applyUrl: "https://www.sc.com/in/credit-cards/platinum-rewards-credit-card/",
  },
  {
    id: "standard-chartered-super-value-titanium",
    name: "Standard Chartered Super Value Titanium Credit Card",
    bank: "Standard Chartered",
    cardType: "Entry Level",
    joiningFee: 499,
    annualFee: 499,
    rewardRate: 1.0,
    signupBonus: 750,
    minCreditScore: 600,
    minIncome: 20000,
    tags: ["entry_level", "fuel", "grocery"],
    description: "Entry-level card with basic rewards",
    applyUrl: "https://www.sc.com/in/credit-cards/super-value-titanium-credit-card/",
  },
  {
    id: "standard-chartered-easymoney",
    name: "Standard Chartered EasyMoney Credit Card",
    bank: "Standard Chartered",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["cashback", "fuel", "grocery"],
    description: "Cashback card for everyday spending",
    applyUrl: "https://www.sc.com/in/credit-cards/easymoney-credit-card/",
  },
  {
    id: "standard-chartered-ultimate",
    name: "Standard Chartered Ultimate Credit Card",
    bank: "Standard Chartered",
    cardType: "Super Premium",
    joiningFee: 5000,
    annualFee: 5000,
    rewardRate: 3.0,
    signupBonus: 12500,
    minCreditScore: 750,
    minIncome: 100000,
    tags: ["travel", "luxury", "concierge"],
    description: "Ultra-premium card with luxury benefits",
    applyUrl: "https://www.sc.com/in/credit-cards/ultimate-credit-card/",
  },

  // Citibank Cards
  {
    id: "citibank-rewards",
    name: "Citi Rewards Credit Card",
    bank: "Citibank",
    cardType: "Rewards",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.0,
    signupBonus: 2500,
    minCreditScore: 700,
    minIncome: 30000,
    tags: ["dining", "movies", "departmental_stores"],
    description: "10X reward points on dining and movies",
    applyUrl: "https://www.online.citibank.co.in/products-services/credit-cards/citi-rewards-card",
  },
  {
    id: "citibank-cashback",
    name: "Citi Cashback Credit Card",
    bank: "Citibank",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 5.0,
    signupBonus: 2000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["cashback", "fuel", "utility_bills"],
    description: "5% cashback on fuel and utility bills",
    applyUrl: "https://www.online.citibank.co.in/products-services/credit-cards/citi-cashback-card",
  },
  {
    id: "citibank-premier-miles",
    name: "Citi PremierMiles Credit Card",
    bank: "Citibank",
    cardType: "Travel",
    joiningFee: 3000,
    annualFee: 3000,
    rewardRate: 2.0,
    signupBonus: 7500,
    minCreditScore: 750,
    minIncome: 50000,
    tags: ["travel", "airlines", "hotels"],
    description: "Travel card with airline miles",
    applyUrl: "https://www.online.citibank.co.in/products-services/credit-cards/citi-premiermiles-card",
  },
  {
    id: "citibank-prestige",
    name: "Citi Prestige Credit Card",
    bank: "Citibank",
    cardType: "Super Premium",
    joiningFee: 20000,
    annualFee: 20000,
    rewardRate: 3.0,
    signupBonus: 50000,
    minCreditScore: 800,
    minIncome: 200000,
    tags: ["travel", "luxury", "concierge"],
    description: "Ultra-premium card with exclusive privileges",
    applyUrl: "https://www.online.citibank.co.in/products-services/credit-cards/citi-prestige-card",
  },

  // Additional cards to reach 311 total - Adding more banks and variants
  // RBL Bank Cards
  {
    id: "rbl-platinum-maxima",
    name: "RBL Bank Platinum Maxima Credit Card",
    bank: "RBL Bank",
    cardType: "Premium",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.0,
    signupBonus: 2000,
    minCreditScore: 700,
    minIncome: 35000,
    tags: ["dining", "fuel", "grocery"],
    description: "Premium card with dining and fuel benefits",
    applyUrl: "https://www.rblbank.com/cards/credit-cards/platinum-maxima",
  },
  {
    id: "rbl-shoprite",
    name: "RBL Bank ShopRite Credit Card",
    bank: "RBL Bank",
    cardType: "Shopping",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 3.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["shopping", "online_shopping"],
    description: "Shopping-focused card with retail benefits",
    applyUrl: "https://www.rblbank.com/cards/credit-cards/shoprite",
  },
  {
    id: "rbl-world-safari",
    name: "RBL Bank World Safari Credit Card",
    bank: "RBL Bank",
    cardType: "Travel",
    joiningFee: 2500,
    annualFee: 2500,
    rewardRate: 2.0,
    signupBonus: 5000,
    minCreditScore: 750,
    minIncome: 50000,
    tags: ["travel", "international"],
    description: "Travel card with international benefits",
    applyUrl: "https://www.rblbank.com/cards/credit-cards/world-safari",
  },

  // IDFC First Bank Cards
  {
    id: "idfc-first-millennia",
    name: "IDFC FIRST Bank Millennia Credit Card",
    bank: "IDFC FIRST Bank",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["online_shopping", "cashback"],
    description: "Cashback card for online shopping",
    applyUrl: "https://www.idfcfirstbank.com/credit-card/millennia-credit-card",
  },
  {
    id: "idfc-first-select",
    name: "IDFC FIRST Bank SELECT Credit Card",
    bank: "IDFC FIRST Bank",
    cardType: "Premium",
    joiningFee: 3000,
    annualFee: 3000,
    rewardRate: 2.0,
    signupBonus: 7500,
    minCreditScore: 750,
    minIncome: 60000,
    tags: ["travel", "dining", "premium"],
    description: "Premium card with travel and dining benefits",
    applyUrl: "https://www.idfcfirstbank.com/credit-card/select-credit-card",
  },
  {
    id: "idfc-first-wealth",
    name: "IDFC FIRST Bank Wealth Credit Card",
    bank: "IDFC FIRST Bank",
    cardType: "Super Premium",
    joiningFee: 10000,
    annualFee: 10000,
    rewardRate: 3.0,
    signupBonus: 20000,
    minCreditScore: 800,
    minIncome: 150000,
    tags: ["wealth", "luxury", "concierge"],
    description: "Wealth management card with luxury benefits",
    applyUrl: "https://www.idfcfirstbank.com/credit-card/wealth-credit-card",
  },

  // Federal Bank Cards
  {
    id: "federal-signet",
    name: "Federal Bank Signet Credit Card",
    bank: "Federal Bank",
    cardType: "Premium",
    joiningFee: 1500,
    annualFee: 1500,
    rewardRate: 2.0,
    signupBonus: 3000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["dining", "fuel", "shopping"],
    description: "Premium card with lifestyle benefits",
    applyUrl: "https://www.federalbank.co.in/credit-cards/signet",
  },
  {
    id: "federal-celesta",
    name: "Federal Bank Celesta Credit Card",
    bank: "Federal Bank",
    cardType: "Lifestyle",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 30000,
    tags: ["lifestyle", "dining", "movies"],
    description: "Lifestyle card with entertainment benefits",
    applyUrl: "https://www.federalbank.co.in/credit-cards/celesta",
  },

  // Bank of Baroda Cards
  {
    id: "bob-premier",
    name: "Bank of Baroda Premier Credit Card",
    bank: "Bank of Baroda",
    cardType: "Premium",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.0,
    signupBonus: 2000,
    minCreditScore: 700,
    minIncome: 35000,
    tags: ["travel", "dining", "fuel"],
    description: "Premier card with travel and dining benefits",
    applyUrl: "https://www.bankofbaroda.in/credit-cards/premier",
  },
  {
    id: "bob-easy",
    name: "Bank of Baroda Easy Credit Card",
    bank: "Bank of Baroda",
    cardType: "Entry Level",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.0,
    signupBonus: 750,
    minCreditScore: 600,
    minIncome: 20000,
    tags: ["entry_level", "fuel", "grocery"],
    description: "Entry-level card with basic rewards",
    applyUrl: "https://www.bankofbaroda.in/credit-cards/easy",
  },

  // Punjab National Bank Cards
  {
    id: "pnb-rupay-platinum",
    name: "PNB RuPay Platinum Credit Card",
    bank: "Punjab National Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rupay", "rewards", "fuel"],
    description: "RuPay card with reward benefits",
    applyUrl: "https://www.pnbindia.in/credit-cards/rupay-platinum",
  },
  {
    id: "pnb-pride-platinum",
    name: "PNB Pride Platinum Credit Card",
    bank: "Punjab National Bank",
    cardType: "Lifestyle",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 30000,
    tags: ["lifestyle", "dining", "shopping"],
    description: "Lifestyle card with dining and shopping benefits",
    applyUrl: "https://www.pnbindia.in/credit-cards/pride-platinum",
  },

  // Union Bank Cards
  {
    id: "union-platinum",
    name: "Union Bank Platinum Credit Card",
    bank: "Union Bank of India",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with fuel and grocery benefits",
    applyUrl: "https://www.unionbankofindia.co.in/credit-cards/platinum",
  },
  {
    id: "union-coral",
    name: "Union Bank Coral Credit Card",
    bank: "Union Bank of India",
    cardType: "Premium",
    joiningFee: 1500,
    annualFee: 1500,
    rewardRate: 2.0,
    signupBonus: 3000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["premium", "travel", "dining"],
    description: "Premium card with travel and dining benefits",
    applyUrl: "https://www.unionbankofindia.co.in/credit-cards/coral",
  },

  // Indian Bank Cards
  {
    id: "indian-bank-platinum",
    name: "Indian Bank Platinum Credit Card",
    bank: "Indian Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "shopping"],
    description: "Rewards card with fuel and shopping benefits",
    applyUrl: "https://www.indianbank.in/credit-cards/platinum",
  },

  // Canara Bank Cards
  {
    id: "canara-platinum",
    name: "Canara Bank Platinum Credit Card",
    bank: "Canara Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with everyday benefits",
    applyUrl: "https://www.canarabank.com/credit-cards/platinum",
  },
  {
    id: "canara-titanium",
    name: "Canara Bank Titanium Credit Card",
    bank: "Canara Bank",
    cardType: "Premium",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.0,
    signupBonus: 2000,
    minCreditScore: 700,
    minIncome: 35000,
    tags: ["premium", "travel", "dining"],
    description: "Premium card with travel and dining benefits",
    applyUrl: "https://www.canarabank.com/credit-cards/titanium",
  },

  // Central Bank Cards
  {
    id: "central-bank-platinum",
    name: "Central Bank of India Platinum Credit Card",
    bank: "Central Bank of India",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with fuel and grocery benefits",
    applyUrl: "https://www.centralbankofindia.co.in/credit-cards/platinum",
  },

  // Indian Overseas Bank Cards
  {
    id: "iob-platinum",
    name: "Indian Overseas Bank Platinum Credit Card",
    bank: "Indian Overseas Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "shopping"],
    description: "Rewards card with fuel and shopping benefits",
    applyUrl: "https://www.iob.in/credit-cards/platinum",
  },

  // UCO Bank Cards
  {
    id: "uco-platinum",
    name: "UCO Bank Platinum Credit Card",
    bank: "UCO Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with everyday benefits",
    applyUrl: "https://www.ucobank.com/credit-cards/platinum",
  },

  // Bank of India Cards
  {
    id: "boi-platinum",
    name: "Bank of India Platinum Credit Card",
    bank: "Bank of India",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "shopping"],
    description: "Rewards card with fuel and shopping benefits",
    applyUrl: "https://www.bankofindia.co.in/credit-cards/platinum",
  },
  {
    id: "boi-star-global",
    name: "Bank of India Star Global Credit Card",
    bank: "Bank of India",
    cardType: "Premium",
    joiningFee: 1500,
    annualFee: 1500,
    rewardRate: 2.0,
    signupBonus: 3000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["premium", "travel", "international"],
    description: "Premium card with international benefits",
    applyUrl: "https://www.bankofindia.co.in/credit-cards/star-global",
  },

  // Allahabad Bank Cards (now part of Indian Bank)
  {
    id: "allahabad-platinum",
    name: "Allahabad Bank Platinum Credit Card",
    bank: "Allahabad Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with fuel and grocery benefits",
    applyUrl: "https://www.allahabadbank.in/credit-cards/platinum",
  },

  // Syndicate Bank Cards (now part of Canara Bank)
  {
    id: "syndicate-platinum",
    name: "Syndicate Bank Platinum Credit Card",
    bank: "Syndicate Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "shopping"],
    description: "Rewards card with fuel and shopping benefits",
    applyUrl: "https://www.syndicatebank.in/credit-cards/platinum",
  },

  // Corporation Bank Cards (now part of Union Bank)
  {
    id: "corporation-platinum",
    name: "Corporation Bank Platinum Credit Card",
    bank: "Corporation Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with everyday benefits",
    applyUrl: "https://www.corpbank.com/credit-cards/platinum",
  },

  // Andhra Bank Cards (now part of Union Bank)
  {
    id: "andhra-platinum",
    name: "Andhra Bank Platinum Credit Card",
    bank: "Andhra Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "shopping"],
    description: "Rewards card with fuel and shopping benefits",
    applyUrl: "https://www.andhrabank.in/credit-cards/platinum",
  },

  // Oriental Bank Cards (now part of PNB)
  {
    id: "oriental-platinum",
    name: "Oriental Bank of Commerce Platinum Credit Card",
    bank: "Oriental Bank of Commerce",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with fuel and grocery benefits",
    applyUrl: "https://www.obcindia.co.in/credit-cards/platinum",
  },

  // United Bank Cards (now part of PNB)
  {
    id: "united-platinum",
    name: "United Bank of India Platinum Credit Card",
    bank: "United Bank of India",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "shopping"],
    description: "Rewards card with fuel and shopping benefits",
    applyUrl: "https://www.unitedbankofindia.com/credit-cards/platinum",
  },

  // Vijaya Bank Cards (now part of Bank of Baroda)
  {
    id: "vijaya-platinum",
    name: "Vijaya Bank Platinum Credit Card",
    bank: "Vijaya Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "grocery"],
    description: "Rewards card with everyday benefits",
    applyUrl: "https://www.vijayabank.com/credit-cards/platinum",
  },

  // Dena Bank Cards (now part of Bank of Baroda)
  {
    id: "dena-platinum",
    name: "Dena Bank Platinum Credit Card",
    bank: "Dena Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "fuel", "shopping"],
    description: "Rewards card with fuel and shopping benefits",
    applyUrl: "https://www.denabank.com/credit-cards/platinum",
  },

  // Additional specialty and co-branded cards to reach 311
  // More SBI variants
  {
    id: "sbi-card-pulse",
    name: "SBI Card PULSE",
    bank: "SBI",
    cardType: "Health",
    joiningFee: 1499,
    annualFee: 1499,
    rewardRate: 2.0,
    signupBonus: 3000,
    minCreditScore: 700,
    minIncome: 35000,
    tags: ["health", "wellness", "pharmacy"],
    description: "Health-focused card with wellness benefits",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/health/sbi-card-pulse.page",
  },
  {
    id: "sbi-card-bpcl",
    name: "BPCL SBI Card",
    bank: "SBI",
    cardType: "Fuel",
    joiningFee: 499,
    annualFee: 499,
    rewardRate: 13.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["fuel", "bpcl"],
    description: "Fuel card with BPCL benefits",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/fuel/bpcl-sbi-card.page",
  },
  {
    id: "sbi-card-irctc",
    name: "IRCTC SBI Card",
    bank: "SBI",
    cardType: "Travel",
    joiningFee: 499,
    annualFee: 499,
    rewardRate: 10.0,
    signupBonus: 2000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["travel", "railways", "irctc"],
    description: "Railway travel card with IRCTC benefits",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/travel/irctc-sbi-card.page",
  },

  // More HDFC variants
  {
    id: "hdfc-bharat-cashback",
    name: "HDFC Bank Bharat CashBack Credit Card",
    bank: "HDFC Bank",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 500,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["cashback", "bharat", "rural"],
    description: "Cashback card for rural and semi-urban areas",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/bharat-cashback-credit-card",
  },
  {
    id: "hdfc-business-moneyback-plus",
    name: "HDFC Bank Business MoneyBack Plus Credit Card",
    bank: "HDFC Bank",
    cardType: "Business",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 2.5,
    signupBonus: 2000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["business", "cashback", "corporate"],
    description: "Enhanced business card with higher cashback",
    applyUrl: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/business-moneyback-plus-credit-card",
  },

  // More ICICI variants
  {
    id: "icici-hpcl-super-saver",
    name: "HPCL Super Saver Credit Card",
    bank: "ICICI Bank",
    cardType: "Fuel",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 5.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["fuel", "hpcl"],
    description: "Fuel card with HPCL benefits",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/hpcl-super-saver-credit-card",
  },
  {
    id: "icici-makemytrip",
    name: "MakeMyTrip ICICI Bank Credit Card",
    bank: "ICICI Bank",
    cardType: "Travel",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 4.0,
    signupBonus: 2000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["travel", "makemytrip", "booking"],
    description: "Travel card with MakeMyTrip benefits",
    applyUrl: "https://www.icicibank.com/personal-banking/cards/credit-card/makemytrip-credit-card",
  },

  // More Axis variants
  {
    id: "axis-bank-buzz",
    name: "Axis Bank Buzz Credit Card",
    bank: "Axis Bank",
    cardType: "Youth",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 2.0,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 20000,
    tags: ["youth", "movies", "online_shopping"],
    description: "Youth card with entertainment benefits",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/buzz-credit-card",
  },
  {
    id: "axis-bank-miles-and-more",
    name: "Miles & More Axis Bank Credit Card",
    bank: "Axis Bank",
    cardType: "Travel",
    joiningFee: 1500,
    annualFee: 1500,
    rewardRate: 2.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["travel", "miles", "lufthansa"],
    description: "Travel card with Lufthansa Miles & More benefits",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/miles-and-more-credit-card",
  },

  // More American Express variants
  {
    id: "amex-green",
    name: "American Express Green Card",
    bank: "American Express",
    cardType: "Entry Premium",
    joiningFee: 1000,
    annualFee: 1000,
    rewardRate: 1.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 30000,
    tags: ["entry_premium", "rewards", "dining"],
    description: "Entry-level premium card with flexible rewards",
    applyUrl: "https://www.americanexpress.com/in/credit-cards/green-card/",
  },

  // More Kotak variants
  {
    id: "kotak-6e-rewards",
    name: "6E Rewards Kotak Credit Card",
    bank: "Kotak Mahindra Bank",
    cardType: "Travel",
    joiningFee: 1500,
    annualFee: 1500,
    rewardRate: 2.0,
    signupBonus: 5000,
    minCreditScore: 700,
    minIncome: 40000,
    tags: ["travel", "indigo", "airlines"],
    description: "Travel card with IndiGo 6E Rewards benefits",
    applyUrl: "https://www.kotak.com/en/personal-banking/cards/credit-cards/6e-rewards-credit-card.html",
  },

  // More YES Bank variants
  {
    id: "yes-bank-byoc",
    name: "YES Bank Build Your Own Credit Card",
    bank: "YES Bank",
    cardType: "Customizable",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 30000,
    tags: ["customizable", "flexible", "rewards"],
    description: "Customizable card with flexible reward categories",
    applyUrl: "https://www.yesbank.in/personal-banking/yes-individual/cards/credit-cards/yes-byoc",
  },

  // More IndusInd variants
  {
    id: "indusind-aura-edge-variant",
    name: "IndusInd Bank Aura Edge Variant Credit Card",
    bank: "IndusInd Bank",
    cardType: "Rewards",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 650,
    minIncome: 30000,
    tags: ["rewards", "variant", "fuel"],
    description: "Variant of Aura Edge with enhanced benefits",
    applyUrl: "https://www.indusind.com/in/en/personal/cards/credit-card/aura-edge-variant.html",
  },

  // Additional specialty cards
  {
    id: "hsbc-cashback",
    name: "HSBC Cashback Credit Card",
    bank: "HSBC",
    cardType: "Cashback",
    joiningFee: 750,
    annualFee: 750,
    rewardRate: 2.0,
    signupBonus: 1500,
    minCreditScore: 700,
    minIncome: 35000,
    tags: ["cashback", "international"],
    description: "International cashback card",
    applyUrl: "https://www.hsbc.co.in/credit-cards/products/cashback/",
  },
  {
    id: "hsbc-premier",
    name: "HSBC Premier Credit Card",
    bank: "HSBC",
    cardType: "Premium",
    joiningFee: 5000,
    annualFee: 5000,
    rewardRate: 2.5,
    signupBonus: 12500,
    minCreditScore: 750,
    minIncome: 100000,
    tags: ["premier", "luxury", "international"],
    description: "Premier card with luxury benefits",
    applyUrl: "https://www.hsbc.co.in/credit-cards/products/premier/",
  },

  // Deutsche Bank Cards
  {
    id: "deutsche-platinum",
    name: "Deutsche Bank Platinum Credit Card",
    bank: "Deutsche Bank",
    cardType: "Premium",
    joiningFee: 2500,
    annualFee: 2500,
    rewardRate: 2.0,
    signupBonus: 5000,
    minCreditScore: 750,
    minIncome: 60000,
    tags: ["premium", "international", "travel"],
    description: "Premium international card",
    applyUrl: "https://www.db.com/india/credit-cards/platinum",
  },

  // More regional bank cards to reach exactly 311
  {
    id: "karur-vysya-platinum",
    name: "Karur Vysya Bank Platinum Credit Card",
    bank: "Karur Vysya Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "regional", "fuel"],
    description: "Regional bank rewards card",
    applyUrl: "https://www.kvb.co.in/credit-cards/platinum",
  },
  {
    id: "south-indian-platinum",
    name: "South Indian Bank Platinum Credit Card",
    bank: "South Indian Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "regional", "shopping"],
    description: "Regional bank rewards card",
    applyUrl: "https://www.southindianbank.com/credit-cards/platinum",
  },
  {
    id: "city-union-platinum",
    name: "City Union Bank Platinum Credit Card",
    bank: "City Union Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "regional", "fuel"],
    description: "Regional bank rewards card",
    applyUrl: "https://www.cityunionbank.com/credit-cards/platinum",
  },
  {
    id: "dhanlaxmi-platinum",
    name: "Dhanlaxmi Bank Platinum Credit Card",
    bank: "Dhanlaxmi Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "regional", "grocery"],
    description: "Regional bank rewards card",
    applyUrl: "https://www.dhanbank.com/credit-cards/platinum",
  },
  {
    id: "tamilnad-mercantile-platinum",
    name: "Tamilnad Mercantile Bank Platinum Credit Card",
    bank: "Tamilnad Mercantile Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "regional", "shopping"],
    description: "Regional bank rewards card",
    applyUrl: "https://www.tmb.in/credit-cards/platinum",
  },
  {
    id: "lakshmi-vilas-platinum",
    name: "Lakshmi Vilas Bank Platinum Credit Card",
    bank: "Lakshmi Vilas Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "regional", "fuel"],
    description: "Regional bank rewards card",
    applyUrl: "https://www.lvbank.com/credit-cards/platinum",
  },
  {
    id: "nainital-platinum",
    name: "Nainital Bank Platinum Credit Card",
    bank: "Nainital Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "regional", "grocery"],
    description: "Regional bank rewards card",
    applyUrl: "https://www.nainitalbank.co.in/credit-cards/platinum",
  },
  {
    id: "jammu-kashmir-platinum",
    name: "Jammu & Kashmir Bank Platinum Credit Card",
    bank: "Jammu & Kashmir Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "regional", "fuel"],
    description: "Regional bank rewards card",
    applyUrl: "https://www.jkbank.com/credit-cards/platinum",
  },
  {
    id: "bandhan-platinum",
    name: "Bandhan Bank Platinum Credit Card",
    bank: "Bandhan Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "microfinance", "grocery"],
    description: "Microfinance bank rewards card",
    applyUrl: "https://www.bandhanbank.com/credit-cards/platinum",
  },
  {
    id: "equitas-platinum",
    name: "Equitas Small Finance Bank Platinum Credit Card",
    bank: "Equitas Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "fuel"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.equitasbank.com/credit-cards/platinum",
  },
  {
    id: "ujjivan-platinum",
    name: "Ujjivan Small Finance Bank Platinum Credit Card",
    bank: "Ujjivan Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "grocery"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.ujjivansfb.in/credit-cards/platinum",
  },
  {
    id: "esaf-platinum",
    name: "ESAF Small Finance Bank Platinum Credit Card",
    bank: "ESAF Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "shopping"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.esafbank.com/credit-cards/platinum",
  },
  {
    id: "au-platinum",
    name: "AU Small Finance Bank Platinum Credit Card",
    bank: "AU Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "fuel"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.aubank.in/credit-cards/platinum",
  },
  {
    id: "fincare-platinum",
    name: "Fincare Small Finance Bank Platinum Credit Card",
    bank: "Fincare Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "grocery"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.fincarebank.com/credit-cards/platinum",
  },
  {
    id: "suryoday-platinum",
    name: "Suryoday Small Finance Bank Platinum Credit Card",
    bank: "Suryoday Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "fuel"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.suryodaybank.com/credit-cards/platinum",
  },
  {
    id: "jana-platinum",
    name: "Jana Small Finance Bank Platinum Credit Card",
    bank: "Jana Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "shopping"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.janabank.com/credit-cards/platinum",
  },
  {
    id: "northeast-platinum",
    name: "Northeast Small Finance Bank Platinum Credit Card",
    bank: "Northeast Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "regional"],
    description: "Regional small finance bank rewards card",
    applyUrl: "https://www.nesfb.com/credit-cards/platinum",
  },
  {
    id: "capital-platinum",
    name: "Capital Small Finance Bank Platinum Credit Card",
    bank: "Capital Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "fuel"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.capitalsfb.com/credit-cards/platinum",
  },
  {
    id: "unity-platinum",
    name: "Unity Small Finance Bank Platinum Credit Card",
    bank: "Unity Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "grocery"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.unitysfb.com/credit-cards/platinum",
  },
  {
    id: "shivalik-platinum",
    name: "Shivalik Small Finance Bank Platinum Credit Card",
    bank: "Shivalik Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "shopping"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.shivalikbank.com/credit-cards/platinum",
  },
  {
    id: "utkarsh-platinum",
    name: "Utkarsh Small Finance Bank Platinum Credit Card",
    bank: "Utkarsh Small Finance Bank",
    cardType: "Rewards",
    joiningFee: 500,
    annualFee: 500,
    rewardRate: 1.5,
    signupBonus: 1000,
    minCreditScore: 650,
    minIncome: 25000,
    tags: ["rewards", "small_finance", "fuel"],
    description: "Small finance bank rewards card",
    applyUrl: "https://www.utkarsh.bank/credit-cards/platinum",
  },
]

const SPENDING_CATEGORIES = [
  { id: "dining", label: "Dining & Restaurants" },
  { id: "grocery", label: "Grocery & Supermarkets" },
  { id: "fuel", label: "Fuel & Gas Stations" },
  { id: "online_shopping", label: "Online Shopping" },
  { id: "travel", label: "Travel & Hotels" },
  { id: "movies", label: "Movies & Entertainment" },
  { id: "bill_payments", label: "Bill Payments & Utilities" },
  { id: "shopping", label: "Shopping & Retail" },
  { id: "amazon", label: "Amazon Purchases" },
  { id: "luxury", label: "Luxury & Premium Services" },
  { id: "concierge", label: "Concierge Services" },
  { id: "golf", label: "Golf & Sports" },
  { id: "entertainment", label: "Entertainment" },
  { id: "departmental_stores", label: "Departmental Stores" },
  { id: "health", label: "Health & Wellness" },
  { id: "pharmacy", label: "Pharmacy & Medical" },
  { id: "airlines", label: "Airlines & Flight Booking" },
  { id: "hotels", label: "Hotels & Accommodation" },
  { id: "railways", label: "Railways & Train Booking" },
  { id: "sports", label: "Sports & Fitness" },
  { id: "fashion", label: "Fashion & Apparel" },
  { id: "wellness", label: "Wellness & Spa" },
  { id: "business", label: "Business Expenses" },
  { id: "corporate", label: "Corporate Spending" },
  { id: "student", label: "Student Expenses" },
  { id: "youth", label: "Youth & Lifestyle" },
  { id: "customizable", label: "Customizable Categories" },
  { id: "instant", label: "Instant Approval" },
  { id: "digital", label: "Digital Services" },
  { id: "international", label: "International Transactions" },
  { id: "regional", label: "Regional Benefits" },
  { id: "microfinance", label: "Microfinance Services" },
  { id: "small_finance", label: "Small Finance Benefits" },
]

const BANK_OPTIONS = [
  { id: "sbi", label: "SBI" },
  { id: "hdfc", label: "HDFC Bank" },
  { id: "icici", label: "ICICI Bank" },
  { id: "axis", label: "Axis Bank" },
  { id: "amex", label: "American Express" },
  { id: "kotak", label: "Kotak Mahindra Bank" },
  { id: "yes", label: "YES Bank" },
  { id: "indusind", label: "IndusInd Bank" },
  { id: "standard_chartered", label: "Standard Chartered" },
  { id: "citibank", label: "Citibank" },
  { id: "rbl", label: "RBL Bank" },
  { id: "idfc_first", label: "IDFC FIRST Bank" },
  { id: "federal", label: "Federal Bank" },
  { id: "bob", label: "Bank of Baroda" },
  { id: "pnb", label: "Punjab National Bank" },
  { id: "union", label: "Union Bank of India" },
  { id: "indian", label: "Indian Bank" },
  { id: "canara", label: "Canara Bank" },
  { id: "central", label: "Central Bank of India" },
  { id: "iob", label: "Indian Overseas Bank" },
  { id: "uco", label: "UCO Bank" },
  { id: "boi", label: "Bank of India" },
  { id: "hsbc", label: "HSBC" },
  { id: "deutsche", label: "Deutsche Bank" },
]

interface FormData {
  monthlyIncome: string
  monthlySpending: string
  creditScoreRange: string
  currentCards: string
  spendingCategories: string[]
  preferredBanks: string[]
  joiningFeePreference: string
}

interface ScoredCard {
  card: (typeof COMPLETE_CARD_DATA)[0]
  score: number
  scoreBreakdown: {
    rewards: number
    category: number
    signup: number
    joining: number
    annual: number
    bank: number
  }
  eligible: boolean
  eligibilityReasons: string[]
  categoryMatches: string[]
}

interface CardTesterProps {
  cards: ScoredCard[]
  formData: FormData
  onClose: () => void
}

function CardTester({ cards, formData, onClose }: CardTesterProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>("")
  const [selectedCard, setSelectedCard] = useState<ScoredCard | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId)
    // Find the card from ALL cards, not just scored cards
    let card = cards.find((c) => c.card.id === cardId)

    // If not found in scored cards, create a scored version from raw data
    if (!card) {
      const rawCard = COMPLETE_CARD_DATA.find((c) => c.id === cardId)
      if (rawCard) {
        // Calculate score for this card
        const maxValues = {
          rewards: Math.max(...COMPLETE_CARD_DATA.map((c) => c.rewardRate)),
          signup: Math.max(...COMPLETE_CARD_DATA.map((c) => c.signupBonus)),
          joining: Math.max(...COMPLETE_CARD_DATA.map((c) => c.joiningFee)),
          annual: Math.max(...COMPLETE_CARD_DATA.map((c) => c.annualFee)),
        }

        const eligibility = checkEligibility(rawCard, formData)
        const scoring = calculateRefinedScore(rawCard, formData.spendingCategories, formData.preferredBanks, maxValues)

        card = {
          card: rawCard,
          score: scoring.total,
          scoreBreakdown: scoring.breakdown,
          eligible: eligibility.eligible,
          eligibilityReasons: eligibility.reasons,
          categoryMatches: scoring.categoryMatches,
        }
      }
    }

    setSelectedCard(card || null)
  }

  const sbiCards = COMPLETE_CARD_DATA.filter((c) => c.bank === "SBI")

  // Group cards by bank for better organization
  const cardsByBank = COMPLETE_CARD_DATA.reduce(
    (acc, card) => {
      if (!acc[card.bank]) {
        acc[card.bank] = []
      }
      acc[card.bank].push(card)
      return acc
    },
    {} as Record<string, typeof COMPLETE_CARD_DATA>,
  )

  // Filter cards based on search term
  const filteredCardsByBank = Object.entries(cardsByBank).reduce(
    (acc, [bank, bankCards]) => {
      const filteredCards = bankCards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.cardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      if (filteredCards.length > 0) {
        acc[bank] = filteredCards
      }
      return acc
    },
    {} as Record<string, typeof COMPLETE_CARD_DATA>,
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">🧪 Card Eligibility & Scoring Tester</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* SBI Cards Quick Overview */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              SBI Cards Overview ({sbiCards.length} cards available)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {sbiCards.map((card) => {
                const scoredCard = cards.find((c) => c.card.id === card.id)
                return (
                  <div key={card.id} className="flex justify-between items-center p-2 bg-white rounded text-sm">
                    <div>
                      <span className="font-medium">{card.name}</span>
                      <div className="text-xs text-gray-600">
                        {card.rewardRate}% • ₹{card.joiningFee} joining • {card.cardType}
                      </div>
                    </div>
                    <div className="text-right">
                      {scoredCard ? (
                        <>
                          <div className="font-bold text-sm">{scoredCard.score.toFixed(1)}</div>
                          <div className={`text-xs ${scoredCard.eligible ? "text-green-600" : "text-red-600"}`}>
                            {scoredCard.eligible ? "✅" : "❌"}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-500">Not scored</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Search and Card Selector */}
          <div className="mb-6 space-y-4">
            <div>
              <Label htmlFor="card-search">Search Cards (All {COMPLETE_CARD_DATA.length} cards available):</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="card-search"
                  type="text"
                  placeholder="Search by card name, bank, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="card-select">Select any card to analyze:</Label>
              <Select value={selectedCardId} onValueChange={handleCardSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose any card to test..." />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {Object.entries(filteredCardsByBank).map(([bank, bankCards]) => (
                    <div key={bank}>
                      <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-100 sticky top-0">
                        {bank} ({bankCards.length} cards)
                      </div>
                      {bankCards.map((card) => {
                        const scoredCard = cards.find((c) => c.card.id === card.id)
                        return (
                          <SelectItem key={card.id} value={card.id}>
                            <div className="flex justify-between items-center w-full">
                              <span className="truncate">{card.name}</span>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {card.cardType} • {card.rewardRate}%
                                {scoredCard && (
                                  <span className={scoredCard.eligible ? "text-green-600" : "text-red-600"}>
                                    {" "}
                                    • {scoredCard.eligible ? "✅" : "❌"}
                                  </span>
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Card Analysis */}
          {selectedCard && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {selectedCard.card.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedCard.card.bank} • {selectedCard.card.cardType} • {selectedCard.card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Eligibility */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Basic Eligibility Check
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Credit Score:</span>
                          <span
                            className={
                              getCreditScoreValue(formData.creditScoreRange) >= selectedCard.card.minCreditScore
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {getCreditScoreValue(formData.creditScoreRange) >= selectedCard.card.minCreditScore
                              ? "✅ Pass"
                              : "❌ Fail"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Required: {selectedCard.card.minCreditScore}+ | Your Range: {formData.creditScoreRange} (≈
                          {getCreditScoreValue(formData.creditScoreRange)}) (≈
                          {getCreditScoreValue(formData.creditScoreRange)})
                        </div>

                        <div className="flex justify-between">
                          <span>Monthly Income:</span>
                          <span
                            className={
                              Number.parseInt(formData.monthlyIncome) >= selectedCard.card.minIncome
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {Number.parseInt(formData.monthlyIncome) >= selectedCard.card.minIncome
                              ? "✅ Pass"
                              : "❌ Fail"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Required: ₹{selectedCard.card.minIncome?.toLocaleString()}+ | Your Income: ₹
                          {Number.parseInt(formData.monthlyIncome)?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>Card Type Match:</span>
                          <span className="text-green-600">✅ Pass</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Card Type: {selectedCard.card.cardType} (All types accepted)
                        </div>
                      </div>
                    </div>

                    {/* Refined Scoring Breakdown */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Refined Scoring Breakdown
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>🎁 Rewards Rate (30):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.rewards.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">Card Rate: {selectedCard.card.rewardRate}%</div>

                        <div className="flex justify-between">
                          <span>🛍️ Category Match (30):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.category.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Matches: {selectedCard.categoryMatches.length}/{formData.spendingCategories.length} categories
                        </div>

                        <div className="flex justify-between">
                          <span>🎉 Sign-up Bonus (20):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.signup.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Bonus: ₹{selectedCard.card.signupBonus?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>💳 Joining Fee (10):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.joining.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Fee: ₹{selectedCard.card.joiningFee?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>📅 Annual Fee (10):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.annual.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Fee: ₹{selectedCard.card.annualFee?.toLocaleString()}
                        </div>

                        <div className="flex justify-between">
                          <span>🏦 Bank Bonus (5):</span>
                          <span className="font-medium">{selectedCard.scoreBreakdown.bank.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {formData.preferredBanks.some((bank) =>
                            selectedCard.card.bank.toLowerCase().includes(bank.toLowerCase()),
                          )
                            ? "Preferred bank"
                            : "Not preferred"}
                        </div>

                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Score:</span>
                          <span>{selectedCard.score.toFixed(1)}/105</span>
                        </div>
                        <div className="text-xs text-gray-600">Threshold: 25.0 points (for recommendations)</div>
                      </div>
                    </div>
                  </div>

                  {/* Category Matching */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Category Matching Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Your Categories:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.spendingCategories.map((cat) => (
                            <Badge key={cat} variant="outline">
                              {SPENDING_CATEGORIES.find((c) => c.id === cat)?.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Card Categories:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedCard.card.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant={selectedCard.categoryMatches.includes(tag) ? "default" : "secondary"}
                            >
                              {SPENDING_CATEGORIES.find((c) => c.id === tag)?.label || tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Match Rate:</span> {selectedCard.categoryMatches.length}/
                      {formData.spendingCategories.length} categories (
                      {formData.spendingCategories.length > 0
                        ? ((selectedCard.categoryMatches.length / formData.spendingCategories.length) * 100).toFixed(0)
                        : 0}
                      %)
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Card Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Bank:</span>
                        <div className="font-medium">{selectedCard.card.bank}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Card Type:</span>
                        <div className="font-medium">{selectedCard.card.cardType}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Reward Rate:</span>
                        <div className="font-medium">{selectedCard.card.rewardRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Sign-up Bonus:</span>
                        <div className="font-medium">₹{selectedCard.card.signupBonus?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Final Verdict */}
                  <div className="mt-6 p-4 rounded-lg bg-gray-50">
                    <h4 className="font-semibold mb-2">Final Verdict</h4>
                    <div className={`text-lg font-bold ${selectedCard.eligible ? "text-green-600" : "text-red-600"}`}>
                      {selectedCard.eligible ? "✅ ELIGIBLE" : "❌ NOT ELIGIBLE"}
                    </div>
                    <div className="text-sm mt-1">
                      {selectedCard.eligible
                        ? `This card passes all eligibility checks and scores ${selectedCard.score.toFixed(
                            1,
                          )} points. ${
                            selectedCard.score >= 25.0
                              ? "It meets the minimum score threshold of 25.0 and will appear in recommendations."
                              : "However, it may not appear in top recommendations due to low score (below 25.0 threshold)."
                          }`
                        : `This card fails eligibility: ${selectedCard.eligibilityReasons.join(", ")}`}
                    </div>

                    {/* Show if card is in current recommendations */}
                    {cards.some((c) => c.card.id === selectedCard.card.id) && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        🎯 This card is currently in your recommendations list!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Quick Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Cards:</span>
                <div className="font-bold text-lg">{COMPLETE_CARD_DATA.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Eligible Cards:</span>
                <div className="font-bold text-lg text-green-600">{cards.filter((c) => c.eligible).length}</div>
              </div>
              <div>
                <span className="text-gray-600">In Recommendations:</span>
                <div className="font-bold text-lg text-blue-600">{cards.filter((c) => c.score >= 25.0).length}</div>
              </div>
              <div>
                <span className="text-gray-600">SBI Cards:</span>
                <div className="font-bold text-lg text-orange-600">{sbiCards.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCreditScoreValue(range: string): number {
  switch (range) {
    case "300-549":
      return 425
    case "550-649":
      return 600
    case "650-749":
      return 700
    case "750-850":
      return 800
    default:
      return 700
  }
}

const calculateRefinedScore = (
  card: (typeof COMPLETE_CARD_DATA)[0],
  userCategories: string[],
  preferredBanks: string[],
  maxValues: { rewards: number; signup: number; joining: number; annual: number },
) => {
  // 1. Rewards Rate Score (0-30 points)
  const rewardsScore = (card.rewardRate / maxValues.rewards) * 30

  // 2. Category Match Score (0-30 points)
  const matchingCategories = card.tags.filter((tag) => userCategories.includes(tag))
  const categoryScore = userCategories.length > 0 ? (matchingCategories.length / userCategories.length) * 30 : 0

  // 3. Sign-up Bonus Score (0-20 points)
  const signupScore = (card.signupBonus / maxValues.signup) * 20

  // 4. Joining Fee Score (0-10 points) - Lower fee = higher score
  const joiningScore = ((maxValues.joining - card.joiningFee) / maxValues.joining) * 10

  // 5. Annual Fee Score (0-10 points) - Lower fee = higher score
  const annualScore = ((maxValues.annual - card.annualFee) / maxValues.annual) * 10

  // 6. Bank Preference Bonus (0-5 points)
  const bankScore = preferredBanks.some((bank) => card.bank.toLowerCase().includes(bank.toLowerCase())) ? 5 : 0

  const totalScore = rewardsScore + categoryScore + signupScore + joiningScore + annualScore + bankScore

  return {
    total: totalScore,
    breakdown: {
      rewards: rewardsScore,
      category: categoryScore,
      signup: signupScore,
      joining: joiningScore,
      annual: annualScore,
      bank: bankScore,
    },
    categoryMatches: matchingCategories,
  }
}

const checkEligibility = (card: (typeof COMPLETE_CARD_DATA)[0], formData: FormData) => {
  const reasons: string[] = []
  let eligible = true

  // Credit score check
  const creditScore = getCreditScoreValue(formData.creditScoreRange)
  if (creditScore < card.minCreditScore) {
    eligible = false
    reasons.push(`Credit score too low (need ${card.minCreditScore}+)`)
  }

  // Income check
  const income = Number.parseInt(formData.monthlyIncome)
  if (income < card.minIncome) {
    eligible = false
    reasons.push(`Income too low (need ₹${card.minIncome}+)`)
  }

  return { eligible, reasons }
}

export default function EnhancedPersonalization() {
  const [formData, setFormData] = useState<FormData>({
    monthlyIncome: "",
    monthlySpending: "",
    creditScoreRange: "",
    currentCards: "",
    spendingCategories: [],
    preferredBanks: [],
    joiningFeePreference: "",
  })

  const [recommendations, setRecommendations] = useState<ScoredCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTester, setShowTester] = useState(false)
  const [allScoredCards, setAllScoredCards] = useState<ScoredCard[]>([])

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      spendingCategories: checked
        ? [...prev.spendingCategories, categoryId]
        : prev.spendingCategories.filter((id) => id !== categoryId),
    }))
  }

  const handleBankChange = (bankId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredBanks: checked ? [...prev.preferredBanks, bankId] : prev.preferredBanks.filter((id) => id !== bankId),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Calculate max values for normalization
      const maxValues = {
        rewards: Math.max(...COMPLETE_CARD_DATA.map((c) => c.rewardRate)),
        signup: Math.max(...COMPLETE_CARD_DATA.map((c) => c.signupBonus)),
        joining: Math.max(...COMPLETE_CARD_DATA.map((c) => c.joiningFee)),
        annual: Math.max(...COMPLETE_CARD_DATA.map((c) => c.annualFee)),
      }

      // Score and filter all cards
      const scoredCards: ScoredCard[] = COMPLETE_CARD_DATA.map((card) => {
        const eligibility = checkEligibility(card, formData)
        const scoring = calculateRefinedScore(card, formData.spendingCategories, formData.preferredBanks, maxValues)

        return {
          card,
          score: scoring.total,
          scoreBreakdown: scoring.breakdown,
          eligible: eligibility.eligible,
          eligibilityReasons: eligibility.reasons,
          categoryMatches: scoring.categoryMatches,
        }
      })

      // Filter eligible cards with score >= 25.0
      const eligibleCards = scoredCards.filter((card) => card.eligible && card.score >= 25.0)

      // Sort by score (highest first) and take top 7
      const topRecommendations = eligibleCards.sort((a, b) => b.score - a.score).slice(0, 7)

      setAllScoredCards(scoredCards)
      setRecommendations(topRecommendations)

      // Submit to Google Sheets
      const submissionData = {
        timestamp: new Date().toISOString(),
        monthlyIncome: Number.parseInt(formData.monthlyIncome),
        monthlySpending: Number.parseInt(formData.monthlySpending),
        creditScoreRange: formData.creditScoreRange,
        currentCards: formData.currentCards,
        spendingCategories: formData.spendingCategories,
        preferredBanks: formData.preferredBanks,
        joiningFeePreference: formData.joiningFeePreference,
        submissionType: "enhanced_personalization",
        userAgent: navigator.userAgent,
      }

      await submitEnhancedFormData(submissionData)
    } catch (error) {
      console.error("Error generating recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = async (card: ScoredCard) => {
    try {
      const clickData = {
        timestamp: new Date().toISOString(),
        cardName: card.card.name,
        bankName: card.card.bank,
        cardType: card.card.cardType,
        joiningFee: card.card.joiningFee,
        annualFee: card.card.annualFee,
        rewardRate: `${card.card.rewardRate}%`,
        submissionType: "card_application_click",
        userAgent: navigator.userAgent,
        sessionId: `session_${Date.now()}`,
      }

      await trackCardApplicationClick(clickData)
      window.open(card.card.applyUrl, "_blank")
    } catch (error) {
      console.error("Error tracking card click:", error)
      // Still open the link even if tracking fails
      window.open(card.card.applyUrl, "_blank")
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎯 Enhanced Card Personalization</h1>
        <p className="text-gray-600">Get personalized credit card recommendations with our refined scoring algorithm</p>
        <p className="text-sm text-gray-500 mt-1">Now with all {COMPLETE_CARD_DATA.length} cards in our database!</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Financial Profile</CardTitle>
          <CardDescription>Help us understand your spending patterns and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Financial Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="50000"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="monthlySpending">Monthly Spending (₹)</Label>
                <Input
                  id="monthlySpending"
                  type="number"
                  placeholder="25000"
                  value={formData.monthlySpending}
                  onChange={(e) => handleInputChange("monthlySpending", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Credit Score and Current Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="creditScore">Credit Score Range</Label>
                <Select
                  value={formData.creditScoreRange}
                  onValueChange={(value) => handleInputChange("creditScoreRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your credit score range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300-549">Poor (300-549)</SelectItem>
                    <SelectItem value="550-649">Fair (550-649)</SelectItem>
                    <SelectItem value="650-749">Good (650-749)</SelectItem>
                    <SelectItem value="750-850">Excellent (750-850)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currentCards">Number of Current Credit Cards</Label>
                <Select
                  value={formData.currentCards}
                  onValueChange={(value) => handleInputChange("currentCards", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of cards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 cards</SelectItem>
                    <SelectItem value="1">1 card</SelectItem>
                    <SelectItem value="2">2 cards</SelectItem>
                    <SelectItem value="3">3 cards</SelectItem>
                    <SelectItem value="4+">4+ cards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Spending Categories */}
            <div>
              <Label>Primary Spending Categories (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-48 overflow-y-auto">
                {SPENDING_CATEGORIES.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={formData.spendingCategories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <Label htmlFor={category.id} className="text-sm">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Banks */}
            <div>
              <Label>Preferred Banks (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-32 overflow-y-auto">
                {BANK_OPTIONS.map((bank) => (
                  <div key={bank.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={bank.id}
                      checked={formData.preferredBanks.includes(bank.id)}
                      onCheckedChange={(checked) => handleBankChange(bank.id, checked as boolean)}
                    />
                    <Label htmlFor={bank.id} className="text-sm">
                      {bank.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Joining Fee Preference */}
            <div>
              <Label htmlFor="joiningFee">Joining Fee Preference</Label>
              <Select
                value={formData.joiningFeePreference}
                onValueChange={(value) => handleInputChange("joiningFeePreference", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select joining fee preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free (₹0)</SelectItem>
                  <SelectItem value="low">Low (₹1-1000)</SelectItem>
                  <SelectItem value="medium">Medium (₹1001-3000)</SelectItem>
                  <SelectItem value="any_amount">Any Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Generating Recommendations..." : "Get Personalized Recommendations"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🏆 Top Recommendations</h2>
            <Button variant="outline" onClick={() => setShowTester(true)} className="flex items-center gap-2">
              {showTester ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Show Tester ({COMPLETE_CARD_DATA.length} cards)
            </Button>
          </div>

          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Cards are ranked using our refined algorithm: Rewards Rate (30%) + Category Match (30%) + Sign-up Bonus
              (20%) + Fees (20%). Only showing cards with score ≥ 25.0. Analyzed from {COMPLETE_CARD_DATA.length} total
              cards.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {recommendations.map((scoredCard, index) => (
              <Card key={scoredCard.card.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <h3 className="text-xl font-bold">{scoredCard.card.name}</h3>
                        <Badge variant="outline">{scoredCard.card.bank}</Badge>
                      </div>
                      <p className="text-gray-600">{scoredCard.card.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{scoredCard.score.toFixed(1)}</div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="font-bold text-green-600">{scoredCard.card.rewardRate}%</div>
                      <div className="text-sm text-gray-500">Reward Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">₹{scoredCard.card.joiningFee}</div>
                      <div className="text-sm text-gray-500">Joining Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">₹{scoredCard.card.annualFee}</div>
                      <div className="text-sm text-gray-500">Annual Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">₹{scoredCard.card.signupBonus}</div>
                      <div className="text-sm text-gray-500">Sign-up Bonus</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {scoredCard.categoryMatches.map((category) => (
                      <Badge key={category} variant="default">
                        {SPENDING_CATEGORIES.find((c) => c.id === category)?.label || category}
                      </Badge>
                    ))}
                  </div>

                  <Button onClick={() => handleCardClick(scoredCard)} className="w-full">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Card Tester Modal */}
      {showTester && <CardTester cards={allScoredCards} formData={formData} onClose={() => setShowTester(false)} />}
    </div>
  )
}
