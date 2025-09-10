"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  RefreshCw,
  Plus,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "@/hooks";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/common/search-input";
import { Pagination } from "@/components/common/pagination";
import {
  DataTable,
  commonActions,
  badgeVariants,
} from "@/components/common/data-table";
import { TankerModal } from "@/components/modals/tankers/tanker-modal";
import { TankerDetailsModal } from "@/components/modals/tankers/tanker-details-modal";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useTankers,
  useCreateTanker,
  useUpdateTanker,
  useDeleteTanker,
} from "@/hooks";
import { useUser } from "@/context/UserContext";

export default function TankersPage() {
  const { user } = useUser();

  // React Query hooks
  const { data: tankersData = [], isLoading, error, refetch } = useTankers();

  const createTankerMutation = useCreateTanker();
  const updateTankerMutation = useUpdateTanker();
  const deleteTankerMutation = useDeleteTanker();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTanker, setEditingTanker] = useState(null);
  const [viewingTanker, setViewingTanker] = useState(null);
  const [deletingTanker, setDeletingTanker] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSuper, setIsSuper] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Check if user is a super admin
  useEffect(() => {
    if (user?.user_type) {
      setIsSuper(user.user_type === "superAdmin");
    }
  }, [user]);

  // Sort tankers by creation date (newest first)
  const sortedTankers = useMemo(() => {
    return [...tankersData].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [tankersData]);

  // Search functionality
  const {
    searchQuery,
    filteredData: searchFilteredTankers,
    handleSearch,
    clearSearch,
  } = useSearch(sortedTankers, [
    "tanker_name",
    "plate_number",
    "availability_status",
  ]);

  // Filter tankers based on search query and status
  const filteredTankers = useMemo(() => {
    let filtered = searchFilteredTankers;

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (tanker) => tanker.availability_status === statusFilter
      );
    }

    return filtered;
  }, [searchFilteredTankers, statusFilter]);

  // Initialize pagination hook
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData: paginatedTankers,
    handlePageChange,
    handleItemsPerPageChange,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(filteredTankers, 10);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Available":
        return "success";
      case "Unavailable":
        return "destructive";
      default:
        return "default";
    }
  };

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
        assigned_driver_id: data.assigned_driver_id
          ? Number.parseInt(data.assigned_driver_id)
          : null,
        phase_id: data.phase_id, // Now sending an array of phase IDs instead of a single ID
      };

      await createTankerMutation.mutateAsync(payload);
      setModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle editing a tanker
  const handleEditTanker = async (data) => {
    if (!editingTanker) {
      toast.error("No tanker selected for editing");
      return;
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
        assigned_driver_id: data.assigned_driver_id
          ? Number.parseInt(data.assigned_driver_id)
          : null,
        phase_id: data.phase_id, // Now sending an array of phase IDs instead of a single ID
      };

      await updateTankerMutation.mutateAsync({
        tankerId: editingTanker.tanker_id,
        tankerData: payload,
      });
      setModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle deleting a tanker
  const handleDeleteTanker = async () => {
    if (!deletingTanker) {
      toast.error("No tanker selected for deletion");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTankerMutation.mutateAsync(deletingTanker.tanker_id);
      setDeleteDialogOpen(false);
      setDeletingTanker(null);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle viewing tanker details
  const handleViewDetails = async (tankerId) => {
    try {
      const tanker = await tankerService.getTankerById(tankerId);
      setViewingTanker(tanker);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch tanker details");
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Tankers list refreshed");
    } catch (error) {
      toast.error("Failed to refresh tankers");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEdit = useCallback((tanker) => {
    setEditingTanker(tanker); // Set the selected tanker for editing
    setModalOpen(true); // Open the edit modal
  }, []);

  const handleDelete = useCallback((tanker) => {
    setDeletingTanker(tanker); // Set the selected tanker for deletion
    setDeleteDialogOpen(true); // Open the delete confirmation dialog
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader heading="Tankers" text="Manage your water tanker fleet">
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
              <SearchInput
                placeholder="Search tankers..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64"
              />

              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredTankers.length}{" "}
                  {filteredTankers.length === 1 ? "tanker" : "tankers"}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 flex items-center justify-between">
                <span>{error.message}</span>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            )}

            <div className="space-y-4">
              <DataTable
                data={paginatedTankers}
                columns={[
                  {
                    key: "tanker_name",
                    header: "Make & Type",
                    accessor: "tanker_name",
                  },
                  {
                    key: "plate_number",
                    header: "Registration Number",
                    accessor: "plate_number",
                  },
                  {
                    key: "capacity",
                    header: "Capacity (G)",
                    accessor: "capacity",
                    align: "right",
                    render: (value) => value?.toLocaleString(),
                  },
                  {
                    key: "price_per_liter",
                    header: "Price/Gallon",
                    accessor: "price_per_liter",
                    align: "right",
                    render: (value) => `Rs. ${Number(value).toFixed(2)}`,
                  },
                  {
                    key: "cost",
                    header: "Cost",
                    accessor: "cost",
                    align: "right",
                    render: (value) => `Rs. ${Number(value).toFixed(2)}`,
                  },
                  {
                    key: "availability_status",
                    header: "Status",
                    accessor: "availability_status",
                    type: "badge",
                    badgeVariant: (value) => getStatusBadgeVariant(value),
                  },
                  {
                    key: "driver",
                    header: "Driver",
                    accessor: "Driver.full_name",
                    render: (value) => value || "—",
                  },
                ]}
                actions={[
                  commonActions.view((tanker) =>
                    handleViewDetails(tanker.tanker_id)
                  ),
                  ...(isSuper
                    ? [
                        commonActions.edit((tanker) => handleEdit(tanker)),
                        commonActions.delete((tanker) => handleDelete(tanker)),
                      ]
                    : []),
                ]}
                isLoading={isLoading}
                emptyMessage="No tankers found"
                searchQuery={searchQuery}
                searchEmptyMessage="No tankers found matching your search"
                className="mt-4"
              />

              {/* Pagination Controls */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredTankers.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className="mt-6"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <TankerModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTanker(null);
        }}
        tanker={editingTanker}
        onSubmit={editingTanker ? handleEditTanker : handleAddTanker}
      />

      <TankerDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setViewingTanker(null);
        }}
        tanker={viewingTanker}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingTanker(null);
        }}
        onConfirm={handleDeleteTanker}
        tanker={deletingTanker}
        isDeleting={isDeleting}
      />
    </DashboardShell>
  );
}
