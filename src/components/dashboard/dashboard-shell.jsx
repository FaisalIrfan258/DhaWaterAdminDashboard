import React from "react"

export function DashboardShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex flex-1 w-full overflow-hidden">
        <main className="flex-1 w-full p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 