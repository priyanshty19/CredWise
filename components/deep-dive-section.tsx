"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Target, Briefcase, ChevronRight } from "lucide-react"
import PortfolioAnalysis from "@/components/portfolio-analysis"

const components = [
  {
    id: "portfolio",
    title: "Current Financial Portfolio & Analysis",
    shortTitle: "Portfolio",
    icon: BarChart3,
    status: "active" as const,
    description: "Upload statements and analyze your current investments",
    component: PortfolioAnalysis,
  },
  {
    id: "goals",
    title: "Goal & Projection Planner",
    shortTitle: "Goals",
    icon: Target,
    status: "soon" as const,
    description: "Set financial goals and create projection plans",
    component: null,
  },
  {
    id: "advisory",
    title: "Fund Management / Advisory",
    shortTitle: "Advisory",
    icon: Briefcase,
    status: "soon" as const,
    description: "Professional fund management and advisory services",
    component: null,
  },
]

export default function DeepDiveSection() {
  const [activeComponent, setActiveComponent] = useState("portfolio")

  const ActiveComponent = components.find((c) => c.id === activeComponent)?.component

  return (
    <div className="space-y-8">
      {/* Custom Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0 overflow-x-auto scrollbar-hide" aria-label="Deep Dive Navigation">
          {components.map((component) => {
            const Icon = component.icon
            const isActive = activeComponent === component.id
            const isDisabled = component.status === "soon"

            return (
              <button
                key={component.id}
                onClick={() => !isDisabled && setActiveComponent(component.id)}
                disabled={isDisabled}
                className={`
                  group relative flex-1 min-w-0 px-3 py-4 text-sm font-medium text-center border-b-2 transition-all duration-200
                  ${
                    isActive
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : isDisabled
                        ? "border-transparent text-gray-400 cursor-not-allowed"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                  sm:flex-none sm:min-w-[200px] lg:min-w-[250px]
                `}
                aria-current={isActive ? "page" : undefined}
                title={component.description}
              >
                <div className="flex items-center justify-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  
                  {/* Progressive text display based on screen size */}
                  <span className="truncate">
                    {/* Mobile: Short titles */}
                    <span className="sm:hidden">{component.shortTitle}</span>
                    {/* Tablet and up: Full titles */}
                    <span className="hidden sm:inline">{component.title}</span>
                  </span>

                  {/* Status badges */}
                  {component.status === "active" && (
                    <Badge 
                      variant="default" 
                      className="ml-2 flex-shrink-0 bg-green-100 text-green-800 text-xs px-2 py-0.5"
                    >
                      Active
                    </Badge>
                  )}
                  {component.status === "soon" && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 flex-shrink-0 bg-gray-100 text-gray-600 text-xs px-2 py-0.5"
                    >
                      Soon
                    </Badge>
                  )}
                </div>

                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
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
                {components.find((c) => c.id === activeComponent)?.icon && (\
                  <components.find((c) => c.id === activeComponent)!.icon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {components.find((c) => c.id === activeComponent)?.title}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                {components.find((c) => c.id === activeComponent)?.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
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
