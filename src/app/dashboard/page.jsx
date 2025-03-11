import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropletIcon, TruckIcon, UsersIcon, CheckCircleIcon } from "lucide-react"

export const metadata = {
  title: "Dashboard",
  description: "Admin dashboard overview",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Water Supply Requests</CardTitle>
            <DropletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">+14% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tankers</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,856</div>
            <p className="text-xs text-muted-foreground">+120 new users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Recent water supply requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for recent requests */}
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">123 Main St</p>
                </div>
                <div className="text-sm">2 hours ago</div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-muted-foreground">456 Oak Ave</p>
                </div>
                <div className="text-sm">4 hours ago</div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Robert Johnson</p>
                  <p className="text-sm text-muted-foreground">789 Pine Rd</p>
                </div>
                <div className="text-sm">6 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tanker Status</CardTitle>
            <CardDescription>Current tanker deployment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for tanker status */}
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Tanker #A123</p>
                  <p className="text-sm text-muted-foreground">Downtown Area</p>
                </div>
                <div className="text-sm text-green-500">Active</div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Tanker #B456</p>
                  <p className="text-sm text-muted-foreground">North District</p>
                </div>
                <div className="text-sm text-green-500">Active</div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Tanker #C789</p>
                  <p className="text-sm text-muted-foreground">East Suburb</p>
                </div>
                <div className="text-sm text-yellow-500">Maintenance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

