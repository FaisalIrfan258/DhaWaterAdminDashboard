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
import { getCookie } from 'cookies-next'

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Fetch all requests
  const fetchRequests = async () => {
    setLoading(true)
    try {
      const accessToken = getCookie('accessToken')
      if (!accessToken) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${baseUrl}/api/admin/requests`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }

      const data = await response.json()
      setRequests(data.requests || [])
      setFilteredRequests(data.requests || [])
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
      request.customer_name?.toLowerCase().includes(query) ||
      request.request_id?.toString().includes(query) ||
      request.status?.toLowerCase().includes(query)
    )
    
    setFilteredRequests(filtered)
  }

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

  useEffect(() => {
    fetchRequests()
  }, [])

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    const variants = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'destructive',
      'completed': 'default'
    }
    return variants[status?.toLowerCase()] || 'secondary'
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Water Supply Requests" text="Manage water supply requests from customers">
        <div className="flex items-center gap-2">
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

      <div className="grid gap-4">
        <Card>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Water Amount</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No requests found matching your search' : 'No requests found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.request_id}>
                        <TableCell className="font-medium">#{request.request_id}</TableCell>
                        <TableCell>{request.customer_name}</TableCell>
                        <TableCell>
                          {new Date(request.request_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{request.water_amount} L</TableCell>
                        <TableCell>Rs. {request.total_price}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status}
                          </Badge>
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
    </DashboardShell>
  )
} 