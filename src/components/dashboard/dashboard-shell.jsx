import React from "react"

export function DashboardShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex flex-1 w-full">
        {/* Sidebar can go here if needed */}
        <main className="flex-1 w-full overflow-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 