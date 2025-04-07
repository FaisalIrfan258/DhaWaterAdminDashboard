"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Droplets, Search, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
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
import AcceptRequestModal from "@/components/accept-request-modal"
import { useUser } from "@/context/UserContext"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Cookies from "js-cookie"

export default function RequestsPage() {
  const { user } = useUser()
  const [adminId, setAdminId] = useState(null)
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All")
  const [rejectReason, setRejectReason] = useState("hydrant closed")
  const [notificationTitle, setNotificationTitle] = useState("")
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  useEffect(() => {
    // Access the admin_id cookie on the client side
    const id = Cookies.get("admin_id")
    setAdminId(id)
  }, [])

  // Fetch all requests
  const fetchRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/api/admin/requests`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }

      const data = await response.json()
      // API returns array directly, not wrapped in requests object
      setRequests(data || [])
      setFilteredRequests(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError('Failed to load requests. Please try again.')
      toast.error('Failed to load requests', {
        description: 'Please refresh the page to try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    
    if (!query.trim()) {
      setFilteredRequests(requests)
      return
    }
    
    const filtered = requests.filter(request => 
      request.Customer?.full_name?.toLowerCase().includes(query) ||
      request.request_id?.toString().includes(query) ||
      request.request_status?.toLowerCase().includes(query) ||
      request.description?.toLowerCase().includes(query)
    )
    
    setFilteredRequests(filtered)
  }

  // Sort requests in descending order by request date
  const sortedRequests = [...requests].sort((a, b) => new Date(b.request_date) - new Date(a.request_date));

  // Update filtered requests to use sorted requests
  useEffect(() => {
    setFilteredRequests(sortedRequests);
  }, [requests]);

  // Update filtered requests based on status filter
  useEffect(() => {
    if (statusFilter === "All") {
      setFilteredRequests(sortedRequests);
    } else {
      setFilteredRequests(sortedRequests.filter(request => request.request_status === statusFilter));
    }
  }, [statusFilter, requests]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchRequests()
      toast.success('Requests refreshed successfully')
    } catch (error) {
      console.error('Error refreshing requests:', error)
      toast.error('Failed to refresh requests')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle accept request
  const handleAccept = async (requestId) => {
    try {
      // Add your accept API call here
      toast.success('Request accepted successfully')
      await fetchRequests() // Refresh the list
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Failed to accept request')
    }
  }

  // Handle reject request
  const handleReject = async () => {
    try {
      if (!selectedRequestId || !selectedCustomerId) return;

      // Use the specified API for rejection
      const response = await fetch(`${baseUrl}/api/bookings/reject-request/${selectedRequestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to reject request');

      // Send notification with customer_id included
      await fetch(`${baseUrl}/api/notification/create-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: notificationTitle,
          message: rejectReason,
          admin_id: adminId,
          customer_id: selectedCustomerId,
        }),
      });

      setRejectDialogOpen(false);
      toast.success('Request rejected successfully');
      await fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleAcceptClick = (requestId, customerId) => {
    setSelectedRequestId(requestId)
    setSelectedCustomerId(customerId)
    setIsModalOpen(true)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    const variants = {
      'pending': 'warning',
      'in progress': 'default',
      'accepted': 'success',
      'rejected': 'destructive'
    }
    return variants[status?.toLowerCase()] || 'secondary'
  }

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/accept-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: selectedRequestId,
          admin_id: adminId,
          customer_id: selectedCustomerId,
        }),
      });
      // Handle response...
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Water Supply Requests" text="Manage water supply requests from customers">
        <div className="flex items-center gap-2">
          <Select onValueChange={setStatusFilter} defaultValue="All">
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 w-full">
        <Card className="max-w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="mr-2 h-5 w-5" />
              Water Supply Requests
            </CardTitle>
            <CardDescription>
              View and manage water supply requests from all customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search requests..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Water Amount</TableHead>
                    {/* <TableHead>Payment Mode</TableHead> */}
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No requests found matching your search' : 'No requests found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.request_id}>
                        <TableCell className="font-medium">#{request.request_id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{request.Customer.full_name}</span>
                            <span className="text-sm text-muted-foreground">
                              ID: {request.Customer.customer_id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(request.request_date)}</TableCell>
                        <TableCell>{request.requested_liters.toLocaleString()} L</TableCell>
                        {/* <TableCell>
                          {request.description.replace('Payment Mode:', '').trim()}
                        </TableCell> */}
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(request.request_status)}>
                            {request.request_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleAcceptClick(request.request_id, request.Customer.customer_id)}
                              disabled={request.request_status.toLowerCase() !== 'in progress'}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedRequestId(request.request_id)
                                setSelectedCustomerId(request.Customer.customer_id)
                                setRejectDialogOpen(true)
                              }}
                              disabled={request.request_status.toLowerCase() !== 'in progress'}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will reject the water supply request. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mb-4">
            <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700">Reject Reason</label>
            <select
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
            >
              <option value="hydrant closed">Hydrant Closed</option>
              <option value="no water available">No Water Available</option>
              <option value="holiday">Holiday</option>
              {/* Add more reasons as needed */}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="notification-title" className="block text-sm font-medium text-gray-700">Notification Title</label>
            <input
              id="notification-title"
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
              placeholder="Enter notification title"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Accept Request Modal */}
      <AcceptRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestId={selectedRequestId}
        customerId={selectedCustomerId}
        adminId={adminId}
      />
    </DashboardShell>
  )
} 