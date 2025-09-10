"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "@/context/UserContext"; // Add this missing import
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { useSensors, useCreateSensor, useUpdateSensor, useDeleteSensor } from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  Plus,
  RefreshCw,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SensorModal } from "@/components/modals/sensors/sensor-modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function DevicesPage() {
  const { user } = useUser();
  const { data: sensorsData, isLoading: loading, error, refetch } = useSensors();
  const createSensorMutation = useCreateSensor();
  const updateSensorMutation = useUpdateSensor();
  const deleteSensorMutation = useDeleteSensor();
  
  // Filtered devices using useMemo for better performance
  const [searchQuery, setSearchQuery] = useState("");
  
  // Extract devices from React Query response
  const devices = sensorsData?.sensors || [];
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "view",
    sensor: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSuper, setIsSuper] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);




  // Filter devices based on search query and status using useMemo
  const sortedDevices = useMemo(() => [...devices].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  ), [devices]);

  const filteredDevices = useMemo(() => {
    let filtered = [...sortedDevices];
    
    // Apply status filter first
    if (statusFilter !== "All") {
      filtered = filtered.filter((device) => device.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (device) =>
          device.sensor_name?.toLowerCase().includes(query) ||
          device.sensor_id?.toString().includes(query) ||
          device.sensor_type?.toLowerCase().includes(query) ||
          device.location?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [sortedDevices, searchQuery, statusFilter]);

  const totalPages = useMemo(() => Math.ceil(filteredDevices.length / itemsPerPage), [filteredDevices, itemsPerPage]);

  const paginatedDevices = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredDevices.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredDevices, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  // Check if user is super admin
  useEffect(() => {
    if (user?.user_type) {
      setIsSuper(user.user_type === "superAdmin");
    }
  }, [user]);

  // Data is automatically fetched by React Query

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
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);



  // Handle search - only update search query, let useEffect handle filtering
  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
  }, []);

  // Add new sensor
  const addSensor = async (sensorData) => {
    try {
      await createSensorMutation.mutateAsync(sensorData);
      return true;
    } catch (err) {
      console.error("Error adding sensor:", err);
      return false;
    }
  };

  // Update existing sensor
  const updateSensor = async (sensorData) => {
    try {
      await updateSensorMutation.mutateAsync(sensorData);
      return true;
    } catch (err) {
      console.error("Error updating sensor:", err);
      return false;
    }
  };

  // Delete sensor
  const deleteSensor = async (sensorId) => {
    try {
      await deleteSensorMutation.mutateAsync(sensorId);
      return true;
    } catch (err) {
      console.error("Error deleting sensor:", err);
      return false;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Devices refreshed successfully");
    } catch (error) {
      console.error("Error refreshing devices:", error);
      toast.error("Failed to refresh devices");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Modal handlers
  const openModal = (mode, sensor = null) => {
    setModalState({ isOpen: true, mode, sensor });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "view", sensor: null });
  };

  const handleModalSubmit = async (formData) => {
    let success = false;

    if (modalState.mode === "add") {
      success = await addSensor(formData);
    } else if (modalState.mode === "edit") {
      success = await updateSensor(formData);
    }

    if (success) {
      closeModal();
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Devices Management"
        text="Manage your IoT devices and sensors"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
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
                  Found {filteredDevices.length}{" "}
                  {filteredDevices.length === 1 ? "device" : "devices"}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                <div className="flex items-center justify-between">
                  <span>Error loading devices: {error.message}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
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
                    {paginatedDevices.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {searchQuery
                            ? "No devices found matching your search"
                            : "No devices found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedDevices.map((device) => (
                        <TableRow key={device.sensor_id || Math.random()}>
                          <TableCell className="font-medium">
                            {device.sensor_id}
                          </TableCell>
                          <TableCell>{device.sensor_name}</TableCell>
                          <TableCell>{device.sensor_details}</TableCell>
                          <TableCell>
                            {device.manufacturing_date
                              ? new Date(
                                  device.manufacturing_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                device.status === "Assigned"
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {device.status || "Unknown"}
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
                                <DropdownMenuItem
                                  onClick={() => openModal("view", device)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                {isSuper && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => openModal("edit", device)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit device
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteDevice(device.sensor_id)
                                      }
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
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {paginatedDevices.length} of {filteredDevices.length} devices
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

      <SensorModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        sensor={modalState.sensor}
        onSubmit={handleModalSubmit}
      />
    </DashboardShell>
  );
}
