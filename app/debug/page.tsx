import Navigation from "@/components/navigation"
import AppsScriptDebugger from "@/components/apps-script-debugger"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apps Script Debugger</h1>
          <p className="text-gray-600 text-lg">
            Test and debug your Google Apps Script integration for the enhanced form structure
          </p>
        </div>

        <AppsScriptDebugger />
      </main>
    </div>
  )
}
