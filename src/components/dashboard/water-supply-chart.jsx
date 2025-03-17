"use client"

import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Sample data - in a real app, you would fetch this from your API
const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 900 },
  { name: "Jul", value: 1100 },
]

export default function WaterSupplyChart() {
  const [period, setPeriod] = useState("7d")

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Water Supply Requests</h3>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

