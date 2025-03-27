"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
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
import { Truck, Search, RefreshCw, Plus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TankerModal } from "@/components/tankers/tanker-modal";
import { TankerDetailsModal } from "@/components/tankers/tanker-details-modal";

export default function TankersPage() {
  const [tankers, setTankers] = useState([]);
  const [filteredTankers, setFilteredTankers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingTanker, setEditingTanker] = useState(null);
  const [viewingTanker, setViewingTanker] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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

  // Fetch all tankers
  const fetchTankers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/tankers`);
      if (!response.ok) throw new Error("Failed to fetch tankers");

      const data = await response.json();
      setTankers(data);
      setFilteredTankers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tankers:", err);
      setError("Failed to load tankers");
      toast.error("Failed to load tankers");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new tanker
  const handleAddTanker = async (data) => {
    try {
      const response = await fetch(`${baseUrl}/api/tankers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add tanker");
      toast.success("Tanker added successfully");
      fetchTankers(); // Refresh the list
      setModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add tanker");
    }
  };

  // Handle editing a tanker
  const handleEditTanker = async (data) => {
    if (!editingTanker) {
      toast.error("No tanker selected for editing");
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/tankers/${editingTanker.tanker_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data), // Send the updated data including availability
        }
      );

      if (!response.ok) throw new Error("Failed to update tanker");
      toast.success("Tanker updated successfully");
      fetchTankers(); // Refresh the list
      setModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update tanker");
    }
  };

  // Handle viewing tanker details
  const handleViewDetails = async (tankerId) => {
    try {
      const response = await fetch(`${baseUrl}/api/tankers/${tankerId}`);
      if (!response.ok) throw new Error("Failed to fetch tanker details");

      const tanker = await response.json();
      setViewingTanker(tanker);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch tanker details");
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredTankers(tankers);
      return;
    }

    const filtered = tankers.filter(
      (tanker) =>
        tanker.tanker_name.toLowerCase().includes(query) ||
        tanker.plate_number.toLowerCase().includes(query) ||
        tanker.availability_status.toLowerCase().includes(query)
    );

    setFilteredTankers(filtered);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTankers();
      toast.success("Tankers list refreshed");
    } catch (error) {
      toast.error("Failed to refresh tankers");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEdit = (tanker) => {
    setEditingTanker(tanker); // Set the selected tanker for editing
    setModalOpen(true); // Open the edit modal
  };

  useEffect(() => {
    fetchTankers();
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
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tanker
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Water Tankers
            </CardTitle>
            <CardDescription>
              View and manage your water tanker fleet.
            </CardDescription>
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
                  Found {filteredTankers.length}{" "}
                  {filteredTankers.length === 1 ? "tanker" : "tankers"}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="relative w-full overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Plate Number</TableHead>
                      <TableHead className="text-right">Capacity (L)</TableHead>
                      <TableHead className="text-right">Price/Liter</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTankers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {searchQuery
                            ? "No tankers found matching your search"
                            : "No tankers found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTankers.map((tanker) => (
                        <TableRow key={tanker.tanker_id}>
                          <TableCell className="font-medium">
                            #{tanker.tanker_id}
                          </TableCell>
                          <TableCell>{tanker.tanker_name}</TableCell>
                          <TableCell>{tanker.plate_number}</TableCell>
                          <TableCell className="text-right">
                            {tanker.capacity.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            Rs. {Number(tanker.price_per_liter).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            Rs. {Number(tanker.cost).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(
                                tanker.availability_status
                              )}
                            >
                              {tanker.availability_status}
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
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewDetails(tanker.tanker_id)
                                  }
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(tanker)}
                                >
                                  Edit Tanker
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
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
        onSubmit={handleEditTanker}
      />

      <TankerDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setViewingTanker(null);
        }}
        tanker={viewingTanker}
      />
    </DashboardShell>
  );
}
