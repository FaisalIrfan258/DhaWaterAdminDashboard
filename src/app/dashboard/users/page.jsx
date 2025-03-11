import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, UserPlus, Filter } from "lucide-react"

export const metadata  = {
  title: "Users Management",
  description: "Manage system users",
}

export default function UsersManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input placeholder="Search by name, email, or phone..." className="max-w-sm" />
            <Button variant="outline">Search</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Sample data - would be fetched from API in real app */}
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell>+1 555-123-4567</TableCell>
                  <TableCell>123 Main St, Apt 4B</TableCell>
                  <TableCell>2023-01-15</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jane Smith</TableCell>
                  <TableCell>jane@example.com</TableCell>
                  <TableCell>+1 555-987-6543</TableCell>
                  <TableCell>456 Oak Ave, Unit 7</TableCell>
                  <TableCell>2023-02-20</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Robert Johnson</TableCell>
                  <TableCell>robert@example.com</TableCell>
                  <TableCell>+1 555-456-7890</TableCell>
                  <TableCell>789 Pine Rd</TableCell>
                  <TableCell>2023-03-10</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Inactive
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
          <CardDescription>Overview of user activity and growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold">2,856</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-xs text-green-600">+120 this month</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold">2,345</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
              <div className="text-xs text-green-600">82% of total</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold">511</div>
              <div className="text-sm text-muted-foreground">Inactive Users</div>
              <div className="text-xs text-yellow-600">18% of total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

