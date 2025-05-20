"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Truck, Search, RefreshCw, Plus, MoreHorizontal, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TankerModal } from "@/components/tankers/tanker-modal"
import { TankerDetailsModal } from "@/components/tankers/tanker-details-modal"
import { DeleteConfirmationDialog } from "@/components/tankers/delete-confirmation-dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Cookies from "js-cookie"

export default function TankersPage() {
  const [tankers, setTankers] = useState([])
  const [filteredTankers, setFilteredTankers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingTanker, setEditingTanker] = useState(null)
  const [viewingTanker, setViewingTanker] = useState(null)
  const [deletingTanker, setDeletingTanker] = useState(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [isSuper, setIsSuper] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedTankers, setPaginatedTankers] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Check if user is a super admin
  useEffect(() => {
    const userType = Cookies.get("user_type")
    setIsSuper(userType === "superAdmin")
  }, [])

  // Apply pagination whenever tankers or pagination settings change
  useEffect(() => {
    paginateTankers()
  }, [filteredTankers, currentPage, itemsPerPage])

  // Paginate tankers function
  const paginateTankers = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentTankers = filteredTankers.slice(indexOfFirstItem, indexOfLastItem)
    
    setPaginatedTankers(currentTankers)
    setTotalPages(Math.ceil(filteredTankers.length / itemsPerPage))
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Available":
        return "success"
      case "Unavailable":
        return "destructive"
      default:
        return "default"
    }
  }

  // Fetch all tankers
  const fetchTankers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/api/tankers`)
      if (!response.ok) throw new Error("Failed to fetch tankers")

      const data = await response.json()
      const sortedTankers = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setTankers(sortedTankers)
      setFilteredTankers(sortedTankers)
      setError(null)
    } catch (err) {
      console.error("Error fetching tankers:", err)
      setError("Failed to load tankers")
      toast.error("Failed to load tankers")
    } finally {
      setLoading(false)
    }
  }

  // Handle adding a new tanker
  const handleAddTanker = async (data) => {
    try {
      const payload = {
        tanker_name: data.tanker_name,
        capacity: Number.parseInt(data.capacity),
        availability_status: data.availability_status,
        plate_number: data.plate_number,
        price_per_liter: data.price_per_liter,
        cost: data.cost,
        assigned_driver_id: data.assigned_driver_id ? Number.parseInt(data.assigned_driver_id) : null,
        phase_id: data.phase_id, // Now sending an array of phase IDs instead of a single ID
      }

      const response = await fetch(`${baseUrl}/api/tankers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to add tanker")
      toast.success("Tanker added successfully")
      fetchTankers() // Refresh the list
      setModalOpen(false)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to add tanker")
    }
  }

  // Handle editing a tanker
  const handleEditTanker = async (data) => {
    if (!editingTanker) {
      toast.error("No tanker selected for editing")
      return
    }

    try {
      const payload = {
        tanker_id: editingTanker.tanker_id,
        tanker_name: data.tanker_name,
        capacity: Number.parseInt(data.capacity),
        availability_status: data.availability_status,
        plate_number: data.plate_number,
        price_per_liter: data.price_per_liter,
        cost: data.cost,
        assigned_driver_id: data.assigned_driver_id ? Number.parseInt(data.assigned_driver_id) : null,
        phase_id: data.phase_id, // Now sending an array of phase IDs instead of a single ID
      }

      const response = await fetch(`${baseUrl}/api/tankers/${editingTanker.tanker_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to update tanker")
      toast.success("Tanker updated successfully")
      fetchTankers() // Refresh the list
      setModalOpen(false)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to update tanker")
    }
  }

  // Handle deleting a tanker
  const handleDeleteTanker = async () => {
    if (!deletingTanker) {
      toast.error("No tanker selected for deletion")
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`${baseUrl}/api/tankers/${deletingTanker.tanker_id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete tanker")
      toast.success("Tanker deleted successfully")
      fetchTankers() // Refresh the list
      setDeleteDialogOpen(false)
      setDeletingTanker(null)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to delete tanker")
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle viewing tanker details
  const handleViewDetails = async (tankerId) => {
    try {
      const response = await fetch(`${baseUrl}/api/tankers/${tankerId}`)
      if (!response.ok) throw new Error("Failed to fetch tanker details")

      const tanker = await response.json()
      setViewingTanker(tanker)
      setDetailsModalOpen(true)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to fetch tanker details")
    }
  }

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (!query.trim()) {
      setFilteredTankers(tankers)
      return
    }

    const filtered = tankers.filter(
      (tanker) =>
        tanker.tanker_name.toLowerCase().includes(query) ||
        tanker.plate_number.toLowerCase().includes(query) ||
        tanker.availability_status.toLowerCase().includes(query) ||
        (tanker.Driver?.full_name && tanker.Driver.full_name.toLowerCase().includes(query)),
    )

    setFilteredTankers(filtered)
  }

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchTankers()
      toast.success("Tankers list refreshed")
    } catch (error) {
      toast.error("Failed to refresh tankers")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleEdit = (tanker) => {
    setEditingTanker(tanker) // Set the selected tanker for editing
    setModalOpen(true) // Open the edit modal
  }

  const handleDelete = (tanker) => {
    setDeletingTanker(tanker) // Set the selected tanker for deletion
    setDeleteDialogOpen(true) // Open the delete confirmation dialog
  }

  // Update filtered tankers based on status filter
  useEffect(() => {
    let filtered = [...tankers]
    if (statusFilter !== "All") {
      filtered = filtered.filter((tanker) => tanker.availability_status === statusFilter)
    }
    setFilteredTankers(filtered)
  }, [statusFilter, tankers])

  useEffect(() => {
    fetchTankers()
  }, [])

  return (
    <DashboardShell>
      <DashboardHeader heading="Tankers" text="Manage your water tanker fleet">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Select onValueChange={setStatusFilter} defaultValue="All">
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          {isSuper && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tanker
            </Button>
          )}
        </div>
      </DashboardHeader>

      <div className="grid gap-4 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Water Tankers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tankers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredTankers.length} {filteredTankers.length === 1 ? "tanker" : "tankers"}
                </div>
              )}
            </div>

            {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">{error}</div>}

            <div className="relative w-full overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Make & Type</TableHead>
                        <TableHead>Registration Number</TableHead>
                        <TableHead className="text-right">Capacity (G)</TableHead>
                        <TableHead className="text-right">Price/Gallon</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTankers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "No tankers found matching your search" : "No tankers found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTankers.map((tanker) => (
                          <TableRow key={tanker.tanker_id}>
                            
                            <TableCell>{tanker.tanker_name}</TableCell>
                            <TableCell>{tanker.plate_number}</TableCell>
                            <TableCell className="text-right">{tanker.capacity.toLocaleString()}</TableCell>
                            <TableCell className="text-right">Rs. {Number(tanker.price_per_liter).toFixed(2)}</TableCell>
                            <TableCell className="text-right">Rs. {Number(tanker.cost).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(tanker.availability_status)}>
                                {tanker.availability_status}
                              </Badge>
                            </TableCell>
                            <TableCell>{tanker.Driver?.full_name || "—"}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(tanker.tanker_id)}>
                                    View Details
                                  </DropdownMenuItem>
                                  {isSuper && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleEdit(tanker)}>Edit Tanker</DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(tanker)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        Delete Tanker
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

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">
                        Showing {paginatedTankers.length} of {filteredTankers.length} tankers
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
            </div>
          </CardContent>
        </Card>
      </div>

      <TankerModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTanker(null)
        }}
        tanker={editingTanker}
        onSubmit={editingTanker ? handleEditTanker : handleAddTanker}
      />

      <TankerDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false)
          setViewingTanker(null)
        }}
        tanker={viewingTanker}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeletingTanker(null)
        }}
        onConfirm={handleDeleteTanker}
        tanker={deletingTanker}
        isDeleting={isDeleting}
      />
    </DashboardShell>
  )
}
