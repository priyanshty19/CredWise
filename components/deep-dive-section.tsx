"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Target,
  Briefcase,
  ChevronRight,
  Construction,
  Sparkles,
  TrendingUp,
  PieChart,
  Calculator,
  Upload,
} from "lucide-react"
import PortfolioAnalysis from "@/components/portfolio-analysis"

const components = [
  {
    id: "portfolio",
    title: "Current Financial Portfolio & Analysis",
    shortTitle: "Portfolio",
    mediumTitle: "Portfolio Analysis",
    icon: BarChart3,
    status: "active" as const,
    description: "Upload statements and analyze your current investments",
    component: PortfolioAnalysis,
  },
  {
    id: "goals",
    title: "Goal & Projection Planner",
    shortTitle: "Goals",
    mediumTitle: "Goal Planner",
    icon: Target,
    status: "soon" as const,
    description: "Set financial goals and create projection plans",
    component: null,
  },
  {
    id: "advisory",
    title: "Fund Management / Advisory",
    shortTitle: "Advisory",
    mediumTitle: "Fund Management",
    icon: Briefcase,
    status: "soon" as const,
    description: "Professional fund management and advisory services",
    component: null,
  },
]

export default function DeepDiveSection() {
  const [activeComponent, setActiveComponent] = useState("portfolio")

  const activeComponentData = components.find((c) => c.id === activeComponent)
  const ActiveComponent = activeComponentData?.component

  return (
    <div className="space-y-8">
      {/* Custom Tab Navigation - Fixed Layout */}
      <div className="border-b border-gray-200">
        <nav className="flex" aria-label="Deep Dive Navigation">
          {components.map((component, index) => {
            const Icon = component.icon
            const isActive = activeComponent === component.id
            const isDisabled = component.status === "soon"

            return (
              <button
                key={component.id}
                onClick={() => setActiveComponent(component.id)} // Made all tabs clickable
                className={`
                  relative flex-1 px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200
                  ${
                    isActive
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : isDisabled
                        ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                  min-w-0
                `}
                aria-current={isActive ? "page" : undefined}
                title={component.description}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 min-w-0">
                  <Icon className="h-4 w-4 flex-shrink-0" />

                  {/* Responsive text with proper wrapping */}
                  <div className="flex flex-col sm:flex-row items-center gap-1 min-w-0">
                    <span className="text-center sm:text-left leading-tight">
                      {/* Mobile: Short titles */}
                      <span className="block sm:hidden">{component.shortTitle}</span>
                      {/* Tablet: Medium titles */}
                      <span className="hidden sm:block lg:hidden">{component.mediumTitle}</span>
                      {/* Desktop: Full titles */}
                      <span className="hidden lg:block">{component.title}</span>
                    </span>

                    {/* Status badges */}
                    {component.status === "active" && (
                      <Badge
                        variant="default"
                        className="flex-shrink-0 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 mt-1 sm:mt-0 sm:ml-2"
                      >
                        Active
                      </Badge>
                    )}
                    {component.status === "soon" && (
                      <Badge
                        variant="secondary"
                        className="flex-shrink-0 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 mt-1 sm:mt-0 sm:ml-2"
                      >
                        Soon
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Active indicator line */}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Component Content */}
      <div className="min-h-[600px]">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                {activeComponentData?.icon && <activeComponentData.icon className="h-8 w-8 text-gray-400" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeComponentData?.title}</h3>
              <p className="text-gray-600 mb-6 max-w-md">{activeComponentData?.description}</p>

              {/* Coming Soon Content for Goals */}
              {activeComponent === "goals" && (
                <div className="space-y-6 max-w-4xl w-full">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 sm:p-8 border-2 border-dashed border-orange-300">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="bg-orange-100 rounded-full p-3">
                        <Construction className="h-8 w-8 text-orange-600" />
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold text-orange-900">Goal & Projection Planner</h4>
                    </div>

                    <p className="text-base sm:text-lg text-orange-800 mb-6 text-center max-w-2xl mx-auto">
                      Set your financial goals, risk preferences, and get a personalized investment roadmap!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-orange-200">
                        <Target className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600 mb-3" />
                        <h5 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">Goal Setting</h5>
                        <p className="text-xs sm:text-sm text-orange-700">
                          Define your financial objectives like home purchase, retirement, or education funding
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-orange-200">
                        <Calculator className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600 mb-3" />
                        <h5 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">Smart Projections</h5>
                        <p className="text-xs sm:text-sm text-orange-700">
                          AI-powered calculations to show exactly how much to invest and when
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-orange-200 sm:col-span-2 lg:col-span-1">
                        <PieChart className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600 mb-3" />
                        <h5 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">Risk Assessment</h5>
                        <p className="text-xs sm:text-sm text-orange-700">
                          Personalized risk profiling to match investments with your comfort level
                        </p>
                      </div>
                    </div>

                    <div className="bg-orange-100 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-orange-800 text-center">
                        <strong>Expected Launch:</strong> Q2 2024 • <strong>Features:</strong> Goal tracking, SIP
                        calculators, retirement planning, tax optimization
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Coming Soon Content for Advisory */}
              {activeComponent === "advisory" && (
                <div className="space-y-6 max-w-4xl w-full">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 sm:p-8 border-2 border-dashed border-purple-300">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="bg-purple-100 rounded-full p-3">
                        <Sparkles className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="text-xl sm:text-2xl font-bold text-purple-900">Fund Management & Advisory</h4>
                    </div>

                    <p className="text-base sm:text-lg text-purple-800 mb-6 text-center max-w-2xl mx-auto">
                      Unlock advanced fund management and personalized advisory services here!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-purple-200">
                        <Briefcase className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600 mb-3" />
                        <h5 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">
                          Portfolio Management
                        </h5>
                        <p className="text-xs sm:text-sm text-purple-700">
                          Professional portfolio rebalancing and optimization services
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-purple-200">
                        <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600 mb-3" />
                        <h5 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Expert Advisory</h5>
                        <p className="text-xs sm:text-sm text-purple-700">
                          One-on-one consultations with certified financial advisors
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-purple-200 sm:col-span-2 lg:col-span-1">
                        <Upload className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600 mb-3" />
                        <h5 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Automated Investing</h5>
                        <p className="text-xs sm:text-sm text-purple-700">
                          Set-and-forget investment strategies with automatic rebalancing
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-100 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-purple-800 text-center">
                        <strong>Expected Launch:</strong> Q3 2024 • <strong>Features:</strong> Robo-advisory, tax-loss
                        harvesting, direct mutual fund investing
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 mt-6">
                <span>Coming Soon</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
