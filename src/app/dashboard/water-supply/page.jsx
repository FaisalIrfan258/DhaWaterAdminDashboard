import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Filter } from "lucide-react"

export const metadata = {
  title: "Water Supply Requests",
  description: "Manage water supply requests",
}

export default function WaterSupplyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Water Supply Requests</h1>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Water supply requests awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Input placeholder="Search by name, address, or phone..." className="max-w-sm" />
                <Button variant="outline">Search</Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Sample data - would be fetched from API in real app */}
                    <TableRow>
                      <TableCell className="font-medium">John Doe</TableCell>
                      <TableCell>123 Main St, Apt 4B</TableCell>
                      <TableCell>+1 555-123-4567</TableCell>
                      <TableCell>2023-03-15</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Pending
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
                      <TableCell>456 Oak Ave, Unit 7</TableCell>
                      <TableCell>+1 555-987-6543</TableCell>
                      <TableCell>2023-03-16</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Pending
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
                      <TableCell>789 Pine Rd</TableCell>
                      <TableCell>+1 555-456-7890</TableCell>
                      <TableCell>2023-03-17</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Pending
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
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Requests</CardTitle>
              <CardDescription>Water supply requests that have been approved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Approved Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Sample data */}
                    <TableRow>
                      <TableCell className="font-medium">Michael Brown</TableCell>
                      <TableCell>321 Elm St</TableCell>
                      <TableCell>+1 555-222-3333</TableCell>
                      <TableCell>2023-03-14</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Approved
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
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Requests</CardTitle>
              <CardDescription>Water supply requests that have been fulfilled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Sample data */}
                    <TableRow>
                      <TableCell className="font-medium">Sarah Wilson</TableCell>
                      <TableCell>555 Maple Dr</TableCell>
                      <TableCell>2023-03-12</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Completed
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
        </TabsContent>

        <TabsContent value="cancelled">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Requests</CardTitle>
              <CardDescription>Water supply requests that were cancelled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Cancelled Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Sample data */}
                    <TableRow>
                      <TableCell className="font-medium">David Lee</TableCell>
                      <TableCell>888 Cedar Ln</TableCell>
                      <TableCell>2023-03-10</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          Cancelled
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

