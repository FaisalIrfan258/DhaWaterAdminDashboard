"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, TrendingUp, FileText, Download } from "lucide-react"
import { useBookings } from "@/hooks"
import { toast } from "sonner"
import { PDFTemplates } from "../../lib/pdfGenerator"

export default function DateRangeDeliveryDetails() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState("All")
  const [areaFilter, setAreaFilter] = useState("All")
  
  // Fetch all bookings
  const { data: bookingsData = [], isLoading } = useBookings()
  
  // Filter deliveries for date range
  const filteredDeliveries = useMemo(() => {
    if (!bookingsData.length) return []
    
    return bookingsData.filter(booking => {
      const bookingDate = new Date(booking.scheduled_date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      // Set end date to end of day
      end.setHours(23, 59, 59, 999)
      
      const dateInRange = bookingDate >= start && bookingDate <= end
      
      const statusMatch = statusFilter === "All" || booking.status === statusFilter
      const areaMatch = areaFilter === "All" || 
        booking.Customer?.Phase?.phase_name === areaFilter
      
      return dateInRange && statusMatch && areaMatch
    })
  }, [bookingsData, startDate, endDate, statusFilter, areaFilter])
  
  // Get unique areas and statuses
  const availableAreas = useMemo(() => {
    const areas = new Set()
    bookingsData.forEach(booking => {
      if (booking.Customer?.Phase?.phase_name) {
        areas.add(booking.Customer.Phase.phase_name)
      }
    })
    return Array.from(areas).sort()
  }, [bookingsData])
  
  const availableStatuses = useMemo(() => {
    const statuses = new Set()
    bookingsData.forEach(booking => {
      if (booking.status) {
        statuses.add(booking.status)
      }
    })
    return Array.from(statuses).sort()
  }, [bookingsData])
  
  // Analytics data
  const analytics = useMemo(() => {
    const totalDeliveries = filteredDeliveries.length
    const deliveredCount = filteredDeliveries.filter(d => d.status === "Delivered").length
    const pendingCount = filteredDeliveries.filter(d => d.status === "Pending").length
    const cancelledCount = filteredDeliveries.filter(d => d.status === "Cancelled").length
    
    const totalCapacity = filteredDeliveries.reduce((sum, d) => sum + (d.Tanker?.capacity || 0), 0)
    const uniqueTankers = new Set(filteredDeliveries.map(d => d.Tanker?.tanker_name)).size
    const uniqueAreas = new Set(filteredDeliveries.map(d => d.Customer?.Phase?.phase_name)).size
    
    // Daily breakdown
    const dailyBreakdown = {}
    filteredDeliveries.forEach(delivery => {
      const date = new Date(delivery.scheduled_date).toISOString().split('T')[0]
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          total: 0,
          delivered: 0,
          pending: 0,
          cancelled: 0,
          capacity: 0
        }
      }
      dailyBreakdown[date].total++
      dailyBreakdown[date][delivery.status.toLowerCase()]++
      dailyBreakdown[date].capacity += delivery.Tanker?.capacity || 0
    })
    
    return {
      totalDeliveries,
      deliveredCount,
      pendingCount,
      cancelledCount,
      totalCapacity,
      uniqueTankers,
      uniqueAreas,
      dailyBreakdown
    }
  }, [filteredDeliveries])
  
  const generateDetailedPDF = () => {
    const summaryStats = [
      { label: 'Total Deliveries', value: analytics.totalDeliveries, color: [66, 139, 202] },
      { label: 'Delivered', value: analytics.deliveredCount, color: [40, 167, 69] },
      { label: 'Pending', value: analytics.pendingCount, color: [255, 193, 7] },
      { label: 'Cancelled', value: analytics.cancelledCount, color: [220, 53, 69] },
      { label: 'Total Capacity', value: `${analytics.totalCapacity.toLocaleString()}G`, color: [108, 117, 125] },
      { label: 'Unique Tankers', value: analytics.uniqueTankers, color: [23, 162, 184] }
    ]

    const keyInfo = [
      { key: 'Date Range', value: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` },
      { key: 'Status Filter', value: statusFilter },
      { key: 'Area Filter', value: areaFilter },
      { key: 'Areas Served', value: analytics.uniqueAreas },
      { key: 'Report Type', value: 'Date Range Delivery Details' },
      { key: 'Generated By', value: 'Admin Dashboard' }
    ]

    const deliveriesTableData = filteredDeliveries.map(delivery => {
      const customer = delivery.Customer || {}
      const scheduledDate = new Date(delivery.scheduled_date).toLocaleDateString()
      
      return [
        delivery.booking_id,
        scheduledDate,
        customer.full_name || "N/A",
        delivery.Tanker?.tanker_name || "N/A",
        delivery.Tanker?.capacity?.toLocaleString() || "N/A",
        customer.Phase?.phase_name || "N/A",
        delivery.status,
        delivery.Admin?.full_name || "N/A"
      ]
    })

    const dailyBreakdownData = Object.entries(analytics.dailyBreakdown)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, data]) => [
        new Date(date).toLocaleDateString(),
        data.total,
        data.delivered || 0,
        data.pending || 0,
        data.cancelled || 0,
        data.capacity.toLocaleString()
      ])

    const reportData = {
      title: 'Date Range Delivery Details Report',
      summary: summaryStats,
      keyInfo: keyInfo,
      headers: ['Booking ID', 'Date', 'Customer', 'Tanker', 'Capacity (G)', 'Area', 'Status', 'Admin'],
      tableData: deliveriesTableData,
      tableTitle: 'Detailed Deliveries',
      additionalTables: Object.keys(analytics.dailyBreakdown).length > 0 ? [
        {
          title: 'Daily Breakdown',
          headers: ['Date', 'Total', 'Delivered', 'Pending', 'Cancelled', 'Capacity (G)'],
          data: dailyBreakdownData,
          theme: 'grid',
          headerStyles: { fillColor: [108, 117, 125], textColor: [255, 255, 255] }
        }
      ] : []
    }

    const options = {
      table: {
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 20 },
          7: { cellWidth: 25 }
        }
      }
    }

    const filename = `delivery-details-${startDate}-to-${endDate}.pdf`
    PDFTemplates.deliveryReport(reportData, options).save(filename)
    toast.success("Detailed PDF report generated successfully")
  }
  
  const exportToCSV = () => {
    const headers = ['Booking ID', 'Date', 'Customer', 'Tanker', 'Capacity (G)', 'Area', 'Status', 'Admin']
    const csvData = filteredDeliveries.map(delivery => {
      const customer = delivery.Customer || {}
      return [
        delivery.booking_id,
        new Date(delivery.scheduled_date).toLocaleDateString(),
        customer.full_name || "N/A",
        delivery.Tanker?.tanker_name || "N/A",
        delivery.Tanker?.capacity || "N/A",
        customer.Phase?.phase_name || "N/A",
        delivery.status,
        delivery.Admin?.full_name || "N/A"
      ]
    })
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `delivery-details-${startDate}-to-${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("CSV file exported successfully")
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Date Range Delivery Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="area-filter">Area</Label>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Areas</SelectItem>
                  {availableAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button 
                onClick={generateDetailedPDF}
                disabled={filteredDeliveries.length === 0}
                size="sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button 
                onClick={exportToCSV}
                disabled={filteredDeliveries.length === 0}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>
          
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
                    <p className="text-2xl font-bold">{analytics.totalDeliveries}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.deliveredCount}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{analytics.pendingCount}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                    <p className="text-2xl font-bold">{analytics.totalCapacity.toLocaleString()}G</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-purple-500"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Daily Breakdown */}
          {Object.keys(analytics.dailyBreakdown).length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Daily Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Cancelled</TableHead>
                        <TableHead>Capacity (G)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(analytics.dailyBreakdown)
                        .sort(([a], [b]) => new Date(a) - new Date(b))
                        .map(([date, data]) => (
                          <TableRow key={date}>
                            <TableCell className="font-medium">
                              {new Date(date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{data.total}</TableCell>
                            <TableCell className="text-green-600">{data.delivered || 0}</TableCell>
                            <TableCell className="text-yellow-600">{data.pending || 0}</TableCell>
                            <TableCell className="text-red-600">{data.cancelled || 0}</TableCell>
                            <TableCell>{data.capacity.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Detailed Deliveries Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tanker</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading deliveries...
                    </TableCell>
                  </TableRow>
                ) : filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No deliveries found for the selected date range and filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((delivery) => {
                    const customer = delivery.Customer || {}
                    
                    return (
                      <TableRow key={delivery.booking_id}>
                        <TableCell className="font-medium">{delivery.booking_id}</TableCell>
                        <TableCell>
                          {new Date(delivery.scheduled_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{customer.full_name || "N/A"}</TableCell>
                        <TableCell>{delivery.Tanker?.tanker_name || "N/A"}</TableCell>
                        <TableCell>{delivery.Tanker?.capacity?.toLocaleString() || "N/A"}G</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {customer.Phase?.phase_name || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              delivery.status === "Delivered" ? "success" :
                              delivery.status === "Pending" ? "warning" :
                              delivery.status === "Cancelled" ? "destructive" :
                              "secondary"
                            }
                          >
                            {delivery.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{delivery.Admin?.full_name || "N/A"}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}