import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

export const metadata= {
  title: "Confirm Booking",
  description: "Confirm water supply bookings",
}

export default function ConfirmBookingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Confirm Booking</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Bookings</CardTitle>
          <CardDescription>Review and confirm water supply bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input placeholder="Search by booking ID or customer name..." className="max-w-sm" />
            <Button variant="outline">Search</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Water Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Sample data - would be fetched from API in real app */}
                <TableRow>
                  <TableCell className="font-medium">BK-2023-001</TableCell>
                  <TableCell>John Doe</TableCell>
                  <TableCell>123 Main St, Apt 4B</TableCell>
                  <TableCell>2023-03-18</TableCell>
                  <TableCell>1000 L</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending Confirmation
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">BK-2023-002</TableCell>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>456 Oak Ave, Unit 7</TableCell>
                  <TableCell>2023-03-19</TableCell>
                  <TableCell>2000 L</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending Confirmation
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">BK-2023-003</TableCell>
                  <TableCell>Robert Johnson</TableCell>
                  <TableCell>789 Pine Rd</TableCell>
                  <TableCell>2023-03-20</TableCell>
                  <TableCell>1500 L</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending Confirmation
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recently Confirmed Bookings</CardTitle>
          <CardDescription>Bookings that have been confirmed in the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Confirmed Date</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Sample data */}
                <TableRow>
                  <TableCell className="font-medium">BK-2023-001</TableCell>
                  <TableCell>Michael Brown</TableCell>
                  <TableCell>321 Elm St</TableCell>
                  <TableCell>2023-03-15</TableCell>
                  <TableCell>2023-03-17</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Confirmed
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">BK-2023-002</TableCell>
                  <TableCell>Sarah Wilson</TableCell>
                  <TableCell>555 Maple Dr</TableCell>
                  <TableCell>2023-03-14</TableCell>
                  <TableCell>2023-03-16</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Delivered
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

