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
import { Cpu, Plus, RefreshCw, Search, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { SensorModal } from "@/components/sensors/sensor-modal"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Cookies from "js-cookie"

export default function DevicesPage() {
  const [devices, setDevices] = useState([])
  const [filteredDevices, setFilteredDevices] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "view",
    sensor: null
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All")
  const [isSuper, setIsSuper] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Fetch all sensors
  const fetchDevices = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${baseUrl}/api/sensor`)
      if (!response.ok) {
        throw new Error('Failed to fetch devices')
      }
      const data = await response.json()
      const devicesList = data.sensors || []
      const sortedDevices = [...devicesList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setDevices(sortedDevices)
      setFilteredDevices(sortedDevices)
      setError(null)
    } catch (err) {
      console.error('Error fetching devices:', err)
      setError('Failed to load devices. Please try again.')
      toast.error('Failed to load devices', {
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
      setFilteredDevices(devices)
      return
    }
    
    const filtered = devices.filter(device => 
      device.sensor_name?.toLowerCase().includes(query) ||
      device.sensor_id?.toString().includes(query) ||
      device.sensor_type?.toLowerCase().includes(query) ||
      device.location?.toLowerCase().includes(query)
    )
    
    setFilteredDevices(filtered)
  }

  // Add new sensor
  const addSensor = async (sensorData) => {
    try {
      const response = await fetch(`${baseUrl}/api/sensor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sensorData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add sensor')
      }
      
      // Refresh the devices list
      await fetchDevices()
      return true
    } catch (err) {
      console.error('Error adding sensor:', err)
      setError('Failed to add sensor. Please try again.')
      return false
    }
  }

  // Update existing sensor
  const updateSensor = async (sensorData) => {
    try {
      const response = await fetch(`${baseUrl}/api/sensor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sensorData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update sensor')
      }
      
      // Refresh the devices list
      await fetchDevices()
      return true
    } catch (err) {
      console.error('Error updating sensor:', err)
      setError('Failed to update sensor. Please try again.')
      return false
    }
  }

  // Delete sensor
  const deleteSensor = async (sensorId) => {
    try {
      const response = await fetch(`${baseUrl}/api/sensor?sensor_id=${sensorId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete sensor')
      }
      
      // Refresh the devices list
      await fetchDevices()
      return true
    } catch (err) {
      console.error('Error deleting sensor:', err)
      setError('Failed to delete sensor. Please try again.')
      return false
    }
  }

  // Example usage in button handlers
  const handleAddDevice = async () => {
    const newSensor = {
      sensor_name: "New sensor",
      sensor_details: "Acha wala sensor",
      manufacturing_date: "2025-02-10"
    }
    const success = await addSensor(newSensor)
    if (success) {
      // Handle success (e.g., show notification)
    }
  }

  const handleEditDevice = async (device) => {
    const updatedSensor = {
      ...device,
      sensor_name: "Updated name"  // Example update
    }
    const success = await updateSensor(updatedSensor)
    if (success) {
      // Handle success
    }
  }

  const handleDeleteDevice = async (sensorId) => {
    const success = await deleteSensor(sensorId)
    if (success) {
      // Handle success
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  // When devices change, update filtered devices
  useEffect(() => {
    if (searchQuery) {
      handleSearch({ target: { value: searchQuery } })
    } else {
      setFilteredDevices(devices)
    }
  }, [devices])

  // Update filtered devices based on status filter
  useEffect(() => {
    let filtered = [...devices];
    if (statusFilter !== "All") {
      filtered = filtered.filter(device => device.status === statusFilter);
    }
    setFilteredDevices(filtered);
  }, [statusFilter, devices]);

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchDevices()
      toast.success('Devices refreshed successfully')
    } catch (error) {
      console.error('Error refreshing devices:', error)
      toast.error('Failed to refresh devices')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Modal handlers
  const openModal = (mode, sensor = null) => {
    setModalState({ isOpen: true, mode, sensor })
  }

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "view", sensor: null })
  }

  const handleModalSubmit = async (formData) => {
    let success = false
    
    if (modalState.mode === "add") {
      success = await addSensor(formData)
    } else if (modalState.mode === "edit") {
      success = await updateSensor(formData)
    }

    if (success) {
      closeModal()
      await fetchDevices()
    }
  }

  // Check if user is super admin
  useEffect(() => {
    const userType = Cookies.get("user_type");
    setIsSuper(userType === "superAdmin");
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader heading="Devices Management" text="Manage your IoT devices and sensors">
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
          <Select onValueChange={setStatusFilter} defaultValue="All">
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Not Assigned">Not Assigned</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => openModal("add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-4 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="mr-2 h-5 w-5" />
              Device Management
            </CardTitle>
            <CardDescription>
              View and manage all connected IoT devices in your water supply network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search devices..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredDevices.length} {filteredDevices.length === 1 ? 'device' : 'devices'}
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
                    <TableHead>Sensor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Manufacturing Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No devices found matching your search' : 'No devices found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDevices.map((device) => (
                      <TableRow key={device.sensor_id || Math.random()}>
                        <TableCell className="font-medium">{device.sensor_id}</TableCell>
                        <TableCell>{device.sensor_name}</TableCell>
                        <TableCell>{device.sensor_details}</TableCell>
                        <TableCell>
                          {device.manufacturing_date ? 
                            new Date(device.manufacturing_date).toLocaleDateString() : 
                            'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={device.status === "Assigned" ? "success" : "destructive"}>
                            {device.status || 'Unknown'}
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
                              <DropdownMenuItem onClick={() => openModal("view", device)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              {isSuper && (
                                <>
                                  <DropdownMenuItem onClick={() => openModal("edit", device)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit device
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteDevice(device.sensor_id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete device
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
            )}
          </CardContent>
        </Card>
      </div>

      <SensorModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        sensor={modalState.sensor}
        onSubmit={handleModalSubmit}
      />
    </DashboardShell>
  )
} 