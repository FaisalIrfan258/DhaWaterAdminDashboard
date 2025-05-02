"use client"

import { useEffect, useState } from "react"
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
import Cookies from "js-cookie"

export default function DriversPage() {
  const [drivers, setDrivers] = useState([])
  const [filteredDrivers, setFilteredDrivers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedDrivers, setPaginatedDrivers] = useState([])
  const [totalPages, setTotalPages] = useState(1)

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  useEffect(() => {
    fetchDrivers()
  }, [])

  useEffect(() => {
    paginateDrivers()
  }, [filteredDrivers, currentPage, itemsPerPage])

  useEffect(() => {
    const userType = Cookies.get("user_type");
    setIsSuper(userType === "superAdmin");
  }, []);

  const paginateDrivers = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDrivers = filteredDrivers.slice(indexOfFirstItem, indexOfLastItem);
    
    setPaginatedDrivers(currentDrivers);
    setTotalPages(Math.ceil(filteredDrivers.length / itemsPerPage));
  };

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

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const fetchDrivers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/api/driver/all`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch drivers")
      }

      const data = await response.json()
      setDrivers(data || [])
      setFilteredDrivers(data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching drivers:", err)
      setError("Failed to load drivers. Please try again.")
      toast.error("Failed to load drivers", {
        description: "Please refresh the page to try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSingleDriver = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/driver/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch driver details")
      }

      const data = await response.json()
      setSelectedDriver(data.data)
      setIsViewDialogOpen(true)
    } catch (err) {
      console.error("Error fetching driver details:", err)
      toast.error("Failed to load driver details")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (!query.trim()) {
      applyStatusFilter(drivers, statusFilter)
      return
    }

    const filtered = drivers.filter(
      (driver) =>
        driver.full_name?.toLowerCase().includes(query) ||
        driver.email?.toLowerCase().includes(query) ||
        driver.phone_number?.includes(query) ||
        driver.license_number?.toLowerCase().includes(query) ||
        driver.username?.toLowerCase().includes(query) ||
        driver.driver_id?.toString().includes(query),
    )

    applyStatusFilter(filtered, statusFilter)
  }

  const applyStatusFilter = (driversArray, status) => {
    if (status === "All") {
      setFilteredDrivers(driversArray)
    } else {
      setFilteredDrivers(driversArray.filter((driver) => driver.availability_status === status))
    }
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)

    if (!searchQuery.trim()) {
      applyStatusFilter(drivers, value)
    } else {
      const searchFiltered = drivers.filter(
        (driver) =>
          driver.full_name?.toLowerCase().includes(searchQuery) ||
          driver.email?.toLowerCase().includes(searchQuery) ||
          driver.phone_number?.includes(searchQuery) ||
          driver.license_number?.toLowerCase().includes(searchQuery) ||
          driver.username?.toLowerCase().includes(searchQuery) ||
          driver.driver_id?.toString().includes(searchQuery),
      )

      applyStatusFilter(searchFiltered, value)
    }
  }

  const sortedDrivers = [...drivers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  useEffect(() => {
    applyStatusFilter(sortedDrivers, statusFilter)
  }, [drivers, statusFilter])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchDrivers()
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
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/driver/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          phone_number: phoneNumber,
          license_number: licenseNumber,
          username: username,
          password: password,
        }),
      })

      if (!response.ok) throw new Error("Failed to create driver")

      toast.success("Driver created successfully")
      setFullName("")
      setEmail("")
      setPhoneNumber("")
      setLicenseNumber("")
      setUsername("")
      setPassword("")
      setIsCreateDialogOpen(false)
      await fetchDrivers()
    } catch (error) {
      console.error("Error creating driver:", error)
      toast.error("Failed to create driver")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDriver = async () => {
    if (!selectedDriver) return

    try {
      const response = await fetch(`${baseUrl}/api/driver/delete/${selectedDriver.driver_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to delete driver")

      setIsDeleteDialogOpen(false)
      toast.success("Driver deleted successfully")
      await fetchDrivers()
    } catch (error) {
      console.error("Error deleting driver:", error)
      toast.error("Failed to delete driver")
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
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/driver/update/${selectedDriver.driver_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: editFullName,
          email: editEmail,
          phone_number: editPhoneNumber,
          license_number: editLicenseNumber,
          username: editUsername,
          availability_status: editStatus,
        }),
      })

      if (!response.ok) throw new Error("Failed to update driver")

      toast.success("Driver updated successfully")
      setIsEditDialogOpen(false)
      await fetchDrivers()
    } catch (error) {
      console.error("Error updating driver:", error)
      toast.error("Failed to update driver")
    } finally {
      setLoading(false)
    }
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
                <Button onClick={handleCreateDriver} disabled={loading}>
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

      <div className="grid gap-4 w-full">
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

            {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">{error}</div>}

            {loading && !isRefreshing ? (
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => fetchSingleDriver(driver.driver_id)}>
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
      </div>

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
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
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
            <Button onClick={handleUpdateDriver} disabled={loading}>
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
