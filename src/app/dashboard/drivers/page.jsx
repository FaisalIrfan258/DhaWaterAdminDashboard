"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useUser } from "@/context/UserContext" // Add this missing import
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Car, Search, RefreshCw, X, Plus, Pencil, Eye, MoreHorizontal, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver, useDriverDeliveryReport } from "@/hooks"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DriversPage() {
  const { user } = useUser()
  
  // React Query hooks
  const { data: driversData = [], isLoading, error, refetch } = useDrivers()
  const createDriverMutation = useCreateDriver()
  const updateDriverMutation = useUpdateDriver()
  const deleteDriverMutation = useDeleteDriver()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  

  // Form states for create
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Form states for edit
  const [editFullName, setEditFullName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhoneNumber, setEditPhoneNumber] = useState("")
  const [editLicenseNumber, setEditLicenseNumber] = useState("")
  const [editUsername, setEditUsername] = useState("")
  const [editStatus, setEditStatus] = useState("")

  const [isSuper, setIsSuper] = useState(false)

  // Driver Deliveries State
  const [driverReportData, setDriverReportData] = useState({
    driverId: "",
    startDate: new Date().toISOString().split('T')[0], // Default to today
    endDate: new Date().toISOString().split('T')[0], // Default to today
    deliveries: []
  })

  const handleDriverReportChange = useCallback((value) => {
    setDriverReportData(prev => ({...prev, driverId: value}))
  }, [])
  
  // React Query hook for driver delivery report
  const { 
    data: deliveriesData, 
    isLoading: isLoadingDeliveries, 
    refetch: fetchDriverDeliveries 
  } = useDriverDeliveryReport(
    driverReportData.driverId, 
    driverReportData.startDate, 
    driverReportData.endDate,
    { enabled: false } // Only fetch when manually triggered
  )

  // Sort drivers by created_at (newest first)
  const sortedDrivers = useMemo(() => {
    if (!driversData || driversData.length === 0) return []
    return [...driversData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [driversData])

  // Filter drivers based on search query and status filter
  const filteredDrivers = useMemo(() => {
    let filtered = [...sortedDrivers]
    
    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((driver) => driver.status === statusFilter)
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (driver) =>
          driver.full_name?.toLowerCase().includes(query) ||
          driver.email?.toLowerCase().includes(query) ||
          driver.phone_number?.toLowerCase().includes(query) ||
          driver.license_number?.toLowerCase().includes(query) ||
          driver.username?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [sortedDrivers, searchQuery, statusFilter])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredDrivers.length / itemsPerPage)
  }, [filteredDrivers, itemsPerPage])

  const paginatedDrivers = useMemo(() => {
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage
    const indexOfLastItem = indexOfFirstItem + itemsPerPage
    return filteredDrivers.slice(indexOfFirstItem, indexOfLastItem)
  }, [filteredDrivers, currentPage, itemsPerPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  useEffect(() => {
    if (user?.user_type) {
      setIsSuper(user.user_type === "superAdmin");
    }
  }, [user]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = useCallback((value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);



  const handleViewDriver = useCallback((driver) => {
    setSelectedDriver(driver)
    setIsViewDialogOpen(true)
  }, [])

  const handleSearch = useCallback((e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
  }, [])

  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value)
  }, [])



  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      toast.success("Drivers list refreshed successfully")
    } catch (error) {
      console.error("Error refreshing drivers:", error)
      toast.error("Failed to refresh drivers")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCreateDriver = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !licenseNumber.trim() ||
      !username.trim() ||
      !password.trim()
    ) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      await createDriverMutation.mutateAsync({
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        license_number: licenseNumber,
        username: username,
        password: password,
      })

      setFullName("")
      setEmail("")
      setPhoneNumber("")
      setLicenseNumber("")
      setUsername("")
      setPassword("")
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating driver:", error)
    }
  }

  const handleDeleteDriver = async () => {
    if (!selectedDriver) return

    try {
      await deleteDriverMutation.mutateAsync(selectedDriver.driver_id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting driver:", error)
    }
  }

  const handleUpdateDriver = async () => {
    if (
      !selectedDriver ||
      !editFullName.trim() ||
      !editEmail.trim() ||
      !editPhoneNumber.trim() ||
      !editLicenseNumber.trim() ||
      !editUsername.trim() ||
      !editStatus
    ) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      await updateDriverMutation.mutateAsync({
        id: selectedDriver.driver_id,
        data: {
          full_name: editFullName,
          email: editEmail,
          phone_number: editPhoneNumber,
          license_number: editLicenseNumber,
          username: editUsername,
          availability_status: editStatus,
        }
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating driver:", error)
    }
  }

  // Fetch driver deliveries
  const handleFetchDriverDeliveries = async () => {
    if (!driverReportData.driverId) {
      toast.error("Please select a driver")
      return
    }
    
    try {
      const result = await fetchDriverDeliveries()
      
      if (result?.data?.status === "success" && Array.isArray(result.data.data)) {
        setDriverReportData({
          ...driverReportData,
          deliveries: result.data.data || []
        })
      } else {
        throw new Error("Invalid response format")
      }
      
    } catch (err) {
      console.error("Error fetching driver deliveries:", err)
      toast.error("Failed to load deliveries")
    }
  }
  
  // Generate PDF for driver deliveries
  const generateDriverDeliveriesPDF = () => {
    if (driverReportData.deliveries.length === 0) {
      toast.error("No deliveries to generate report for")
      return
    }
    
    const selectedDriverForReport = driversData.find(driver => driver.driver_id === parseInt(driverReportData.driverId))
    if (!selectedDriverForReport) return
    
    // Format dates for display
    const startDateFormatted = new Date(driverReportData.startDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })
    
    const endDateFormatted = new Date(driverReportData.endDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })
    
    const doc = new jsPDF()
    let yPosition = 20 // Starting position
    
    // Title
    doc.setFontSize(18)
    doc.text("DRIVER DELIVERY REPORT", 105, yPosition, { align: "center" })
    doc.setFontSize(12)
    
    // Header Info
    yPosition = 40
    doc.text(`Driver: ${selectedDriverForReport.full_name}`, 20, yPosition)
    doc.text(`Period: ${startDateFormatted} to ${endDateFormatted}`, 140, yPosition)
    
    // Deliveries Table
    const deliveriesTableData = driverReportData.deliveries.map(delivery => {
      const customer = delivery.Customer || {}
      const address = customer.street_address ? 
        `${customer.street_address}, Phase ${customer.Phase?.phase_name || 'N/A'}` : 
        `Phase ${customer.Phase?.phase_name || 'N/A'}`
        
      return [
        delivery.booking_id,
        customer.full_name || "N/A",
        delivery.Tanker?.tanker_name || "N/A",
        delivery.scheduled_date || "N/A",
        address,
        delivery.status || "N/A"
      ]
    })
    
    // Add total row
    deliveriesTableData.push(['Total Deliveries: ' + driverReportData.deliveries.length, '', '', '', '', ''])
    
    yPosition = 50
    autoTable(doc, {
      startY: yPosition,
      head: [['Booking ID', 'Customer', 'Tanker', 'Date', 'Address', 'Status']],
      body: deliveriesTableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] }
    })
    
    // Summary
    yPosition = doc.lastAutoTable.finalY + 20
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, yPosition)
    
    doc.save(`driver-deliveries-${selectedDriverForReport.full_name}-${startDateFormatted}-to-${endDateFormatted}.pdf`.replace(/\s+/g, '_').replace(/,/g, ''))
  }

  const openEditDialog = (driver) => {
    setSelectedDriver(driver)
    setEditFullName(driver.full_name)
    setEditEmail(driver.email)
    setEditPhoneNumber(driver.phone_number)
    setEditLicenseNumber(driver.license_number)
    setEditUsername(driver.username)
    setEditStatus(driver.availability_status)
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadgeVariant = (status) => {
    return status === "Available" ? "success" : "destructive"
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Drivers" text="Manage water tanker drivers">
        <div className="flex items-center gap-2">
          <Select onValueChange={handleStatusFilterChange} defaultValue="All">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>Enter the details to add a new driver.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      placeholder="1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="license-number">License Number</Label>
                    <Input
                      id="license-number"
                      placeholder="DL123456"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="johndoe123"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDriver} disabled={createDriverMutation.isPending}>
                  Add Driver
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </DashboardHeader>

      <Tabs defaultValue="drivers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drivers">Drivers Management</TabsTrigger>
          <TabsTrigger value="reports">Delivery Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="drivers" className="space-y-4">
          <Card className="max-w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5" />
              Water Tanker Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search drivers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredDrivers.length} {filteredDrivers.length === 1 ? "driver" : "drivers"}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 flex items-center justify-between">
                <span>{error.message || 'An error occurred while loading drivers'}</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            )}

            {isLoading && !isRefreshing ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDrivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "No drivers found matching your search" : "No drivers found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedDrivers.map((driver) => (
                        <TableRow key={driver.driver_id}>
                          <TableCell className="font-medium">#{driver.driver_id}</TableCell>
                          <TableCell>{driver.full_name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{driver.phone_number}</span>
                              <span className="text-xs text-muted-foreground">{driver.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>{driver.license_number}</TableCell>
                          <TableCell>{driver.username}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(driver.availability_status)}>
                              {driver.availability_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" modal={false}>
                                <DropdownMenuItem onClick={() => handleViewDriver(driver)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                {isSuper && (
                                  <>
                                    <DropdownMenuItem onClick={() => openEditDialog(driver)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit driver
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedDriver(driver)
                                        setIsDeleteDialogOpen(true)
                                      }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete driver
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {paginatedDrivers.length} of {filteredDrivers.length} drivers
                    </p>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={handleItemsPerPageChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">per page</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Delivery Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverSelect">Select Driver</Label>
                  <Select 
                    value={driverReportData.driverId} 
                    onValueChange={handleDriverReportChange}
                  >
                    <SelectTrigger id="driverSelect" disabled={isLoading}>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {driversData.map((driver) => (
                        <SelectItem key={driver.driver_id} value={driver.driver_id.toString()}>
                          {driver.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date"
                    value={driverReportData.startDate}
                    onChange={(e) => setDriverReportData({...driverReportData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date"
                    value={driverReportData.endDate}
                    onChange={(e) => setDriverReportData({...driverReportData, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleFetchDriverDeliveries}
                disabled={isLoadingDeliveries || !driverReportData.driverId}
              >
                {isLoadingDeliveries ? "Loading..." : "View Deliveries"}
              </Button>
              
              {driverReportData.deliveries.length > 0 ? (
                <div className="space-y-4">
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Tanker</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {driverReportData.deliveries.map((delivery) => {
                          const customer = delivery.Customer || {}
                          const address = customer.street_address ? 
                            `${customer.street_address}, Phase ${customer.Phase?.phase_name || 'N/A'}` : 
                            `Phase ${customer.Phase?.phase_name || 'N/A'}`
                            
                          return (
                            <TableRow key={delivery.booking_id}>
                              <TableCell>{delivery.booking_id}</TableCell>
                              <TableCell>{customer.full_name || "N/A"}</TableCell>
                              <TableCell>{delivery.Tanker?.tanker_name || "N/A"}</TableCell>
                              <TableCell>{delivery.scheduled_date || "N/A"}</TableCell>
                              <TableCell>{address}</TableCell>
                              <TableCell>{delivery.status || "N/A"}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Total Deliveries</p>
                        <p className="text-2xl font-bold">{driverReportData.deliveries.length}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Date Range</p>
                        <p className="text-lg font-medium">
                          {new Date(driverReportData.startDate).toLocaleDateString('en-US', {
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric'
                          })} to {new Date(driverReportData.endDate).toLocaleDateString('en-US', {
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={generateDriverDeliveriesPDF}>
                    Generate Driver Delivery PDF
                  </Button>
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md">
                  {isLoadingDeliveries ? (
                    <p>Loading deliveries...</p>
                  ) : (
                    <p>No deliveries found for the selected driver and date</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>View the details of this driver.</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">ID:</span>
                <span className="col-span-3">#{selectedDriver.driver_id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Name:</span>
                <span className="col-span-3">{selectedDriver.full_name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Email:</span>
                <span className="col-span-3">{selectedDriver.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Phone:</span>
                <span className="col-span-3">{selectedDriver.phone_number}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">License:</span>
                <span className="col-span-3">{selectedDriver.license_number}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Username:</span>
                <span className="col-span-3">{selectedDriver.username}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Status:</span>
                <span className="col-span-3">
                  <Badge variant={getStatusBadgeVariant(selectedDriver.availability_status)}>
                    {selectedDriver.availability_status}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Created:</span>
                <span className="col-span-3">{formatDate(selectedDriver.created_at)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update the driver's information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-full-name">Full Name</Label>
                <Input
                  id="edit-full-name"
                  placeholder="John Doe"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="john@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone-number">Phone Number</Label>
                <Input
                  id="edit-phone-number"
                  placeholder="1234567890"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-license-number">License Number</Label>
                <Input
                  id="edit-license-number"
                  placeholder="DL123456"
                  value={editLicenseNumber}
                  onChange={(e) => setEditLicenseNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  placeholder="johndoe123"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus} modal={false}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent modal={false}>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDriver} disabled={updateDriverMutation.isPending}>
              Update Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this driver. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDriver}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
