"use client"

import { Droplet, Truck, Calendar, Users } from "lucide-react"

export default function DashboardStats() {
  // In a real app, you would fetch this data from your API
  const stats = [
    {
      title: "Total Water Requests",
      value: "1,234",
      change: "+12.3%",
      changeType: "positive",
      icon: Droplet,
    },
    {
      title: "Active Tankers",
      value: "56",
      change: "+3.2%",
      changeType: "positive",
      icon: Truck,
    },
    {
      title: "Pending Bookings",
      value: "23",
      change: "-5.1%",
      changeType: "negative",
      icon: Calendar,
    },
    {
      title: "Total Users",
      value: "3,456",
      change: "+8.7%",
      changeType: "positive",
      icon: Users,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
            <div className="rounded-full bg-primary/10 p-2">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className={`text-sm ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
              {stat.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

