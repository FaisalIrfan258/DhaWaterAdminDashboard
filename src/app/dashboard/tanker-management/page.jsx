import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Truck, Edit, MapPin } from "lucide-react"

export const metadata = {
  title: "Tanker Management",
  description: "Manage water supply tankers",
}

export default function TankerManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tanker Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Tanker
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Tankers</TabsTrigger>
          <TabsTrigger value="maintenance">In Maintenance</TabsTrigger>
          <TabsTrigger value="all">All Tankers</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tankers</CardTitle>
              <CardDescription>Tankers currently in service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Input placeholder="Search by tanker ID or driver name..." className="max-w-sm" />
                <Button variant="outline">Search</Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanker ID</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Current Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Maintenance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Sample data - would be fetched from API in real app */}
                    <TableRow>
                      <TableCell className="font-medium">TK-A123</TableCell>
                      <TableCell>John Driver</TableCell>
                      <TableCell>5000 L</TableCell>
                      <TableCell>Downtown Area</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>2023-02-15</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8">
                            <MapPin className="mr-2 h-4 w-4" />
                            Track
                          </Button>
                          <Button size="sm" variant="outline" className="h-8">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">TK-B456</TableCell>
                      <TableCell>Mike Trucker</TableCell>
                      <TableCell>8000 L</TableCell>
                      <TableCell>North District</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>2023-02-20</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8">
                            <MapPin className="mr-2 h-4 w-4" />
                            Track
                          </Button>
                          <Button size="sm" variant="outline" className="h-8">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tankers in Maintenance</CardTitle>
              <CardDescription>Tankers currently undergoing maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanker ID</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Maintenance Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Expected Completion</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Sample data */}
                    <TableRow>
                      <TableCell className="font-medium">TK-C789</TableCell>
                      <TableCell>6000 L</TableCell>
                      <TableCell>Regular Service</TableCell>
                      <TableCell>2023-03-15</TableCell>
                      <TableCell>2023-03-18</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Maintenance
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-8">
                          <Truck className="mr-2 h-4 w-4" />
                          Mark as Ready
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tankers</CardTitle>
              <CardDescription>Complete list of all tankers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanker ID</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Sample data */}
                    <TableRow>
                      <TableCell className="font-medium">TK-A123</TableCell>
                      <TableCell>John Driver</TableCell>
                      <TableCell>5000 L</TableCell>
                      <TableCell>ABC-123</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-8">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">TK-B456</TableCell>
                      <TableCell>Mike Trucker</TableCell>
                      <TableCell>8000 L</TableCell>
                      <TableCell>DEF-456</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-8">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">TK-C789</TableCell>
                      <TableCell>Unassigned</TableCell>
                      <TableCell>6000 L</TableCell>
                      <TableCell>GHI-789</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Maintenance
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-8">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

