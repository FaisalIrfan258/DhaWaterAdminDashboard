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
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { SensorModal } from "@/components/modals/sensors/sensor-modal";
import { toast } from "sonner";
import { usePagination } from "@/hooks";
import { Pagination } from "@/components/common/pagination";
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
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/common/search-input";

export default function DevicesPage() {
  const { user } = useUser();
  const { data: sensorsData, isLoading: loading, error, refetch } = useSensors();
  const createSensorMutation = useCreateSensor();
  const updateSensorMutation = useUpdateSensor();
  const deleteSensorMutation = useDeleteSensor();
  
  // Filtered devices using useMemo for better performance
  
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
  // Filter devices based on search query and status using useMemo
  const sortedDevices = useMemo(() => [...devices].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  ), [devices]);

  // Search functionality
  const {
    searchQuery,
    filteredData: searchFilteredDevices,
    handleSearch,
    clearSearch
  } = useSearch(sortedDevices, ['sensor_name', 'sensor_id', 'sensor_type', 'location']);

  const filteredDevices = useMemo(() => {
    let filtered = [...searchFilteredDevices];
    
    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((device) => device.status === statusFilter);
    }
    
    return filtered;
  }, [searchFilteredDevices, statusFilter]);

  // Initialize pagination hook
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData: paginatedDevices,
    handlePageChange,
    handleItemsPerPageChange,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(filteredDevices, 10);

  // Check if user is super admin
  useEffect(() => {
    if (user?.user_type) {
      setIsSuper(user.user_type === "superAdmin");
    }
  }, [user]);

  // Data is automatically fetched by React Query





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

  const handleDeleteDevice = async (sensorId) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      const success = await deleteSensor(sensorId);
      if (success) {
        toast.success("Device deleted successfully");
      } else {
        toast.error("Failed to delete device");
      }
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
              <SearchInput
                placeholder="Search devices..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64"
              />

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
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredDevices.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  className="mt-6"
                />
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
