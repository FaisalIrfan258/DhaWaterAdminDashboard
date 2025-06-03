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
import { Users, Plus, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserModal } from "@/components/users/user-modal";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { ViewUserModal } from "@/components/users/view-user-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sensors, setSensors] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const [isSuper, setIsSuper] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedUsers, setPaginatedUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // Apply pagination whenever users or pagination settings change
  useEffect(() => {
    paginateUsers();
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Paginate users function
  const paginateUsers = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    
    setPaginatedUsers(currentUsers);
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
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
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/users/`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      const usersList = data.users || [];

      // Sort users by created_at in descending order
      const sortedUsers = [...usersList].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      // Update to include all relevant fields
      const formattedUsers = sortedUsers.map((user) => {
        // Format the address by combining street_address and phase_number if available
        let displayAddress = user.street_address || user.home_address || '';
        if (user.phase_number) {
          displayAddress += ` Phase ${user.phase_number}`;
        } else if (user.Phase && user.Phase.phase_name) {
          displayAddress += ` Phase ${user.Phase.phase_name}`;
        }
        
        return {
          customer_id: user.customer_id,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          home_address: displayAddress, // Use the combined address for display
          street_address: user.street_address,
          phase_number: user.phase_number,
          username: user.username,
          balance: user.balance, // Include balance
          created_at: user.created_at,
          category: user.category, // Include category field
          WaterTanks: user.WaterTanks.map((tank) => ({
            sensor_id: tank.sensor_id, // Map sensor_id from WaterTanks
            sensor_name: tank.Sensor?.sensor_name || `Sensor ${tank.sensor_id}` // Include sensor name
          })),
          userType: user.UserType.type, // Include user type
          userTypeDescription: user.UserType.description, // Include user type description
        };
      });

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers); // Initialize filtered users with all users
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users", {
        description: "Please refresh the page to try again.",
      });
    }
  };

  // Fetch sensors for the dropdown
  const fetchSensors = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/sensor`);
      if (!response.ok) throw new Error("Failed to fetch sensors");
      const data = await response.json();
      setSensors(data.sensors || []);
    } catch (error) {
      console.error("Error fetching sensors:", error);
      toast.error("Failed to load sensors", {
        description: "Please refresh the page to try again.",
      });
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone_number?.includes(query) ||
        user.home_address?.toLowerCase().includes(query) ||
        user.street_address?.toLowerCase().includes(query) ||
        (user.phase_number && user.phase_number.toString().includes(query)) ||
        user.username?.toLowerCase().includes(query) ||
        user.customer_id?.toString().includes(query)
    );

    setFilteredUsers(filtered);
  };

  // Add new user
  const handleAddUser = async (userData) => {
    setIsLoading(true);

    const loadingToast = toast.loading("Creating user...");

    try {
      const response = await fetch(`${baseUrl}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      toast.dismiss(loadingToast);
      toast.success("User created successfully!", {
        description: `${userData.full_name} has been added to the system.`,
      });

      await fetchUsers();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to create user", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing user
  const handleUpdateUser = async (userData) => {
    setIsLoading(true);

    const loadingToast = toast.loading("Updating user...");

    try {
      const response = await fetch(`${baseUrl}/api/customer/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast.dismiss(loadingToast);
      toast.success("User updated successfully!", {
        description: `${userData.full_name}'s information has been updated.`,
      });

      await fetchUsers();
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to update user", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user edit
  const handleEditUser = async (user) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/api/customer/customer-profile?customer_id=${user.customer_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();

      // Format the user data for the modal
      const formattedUser = {
        customer_id: data.customer_id,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        street_address: data.street_address,
        phase_number: data.Phase?.phase_id || data.phase_number,
        username: data.username,
        password: "", // Clear password when editing
        balance: data.balance || 0,
        created_at: data.created_at,
        tank_capacity: data.WaterTanks?.[0]?.capacity || 0,
        device_id: data.WaterTanks?.[0]?.sensor_id?.toString() || "", // Ensure sensor ID is properly passed
        category: data.UserType?.type === "C" ? "Corporate" : 
                 data.UserType?.type === "E" ? "DHAEmployee" : "Civil",
        WaterTanks: data.WaterTanks // Include the full WaterTanks data
      };

      setEditingUser(formattedUser);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view user details
  const handleViewUser = (user) => {
    router.push(`/dashboard/users/${user.customer_id}`);
  };

  // Open delete confirmation dialog
  const confirmDeleteUser = (user) => {
    if (!isSuper) {
      toast.error("You do not have permission to delete users.");
      return;
    }
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const loadingToast = toast.loading("Deleting user...");

    try {
      const response = await fetch(
        `${baseUrl}/api/customer/delete?customer_id=${userToDelete.customer_id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast.dismiss(loadingToast);
      toast.success("User deleted successfully");

      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to delete user", {
        description:
          "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingUser(null);
  };

  // Add a refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchUsers(), fetchSensors()]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSensors();
  }, []);

  // When users change, update filtered users
  useEffect(() => {
    if (searchQuery) {
      handleSearch({ target: { value: searchQuery } });
    } else {
      setFilteredUsers(users);
    }
  }, [users]);

  // Format date to local string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if user is super admin
  useEffect(() => {
    const userType = Cookies.get("user_type");
    setIsSuper(userType === "superAdmin");
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Users Management"
        text="Manage your customer accounts"
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
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "user" : "users"}
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sensor</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchQuery
                        ? "No users found matching your search"
                        : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.customer_id}>
                      <TableCell className="font-medium">
                        {user.customer_id}
                      </TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.phone_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {user.home_address}
                      </TableCell>
                      <TableCell>
                        {user.category ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {user.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.WaterTanks && user.WaterTanks.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {user.WaterTanks.map((tank, index) => (
                              <Badge key={index} variant="secondary">
                                {tank.sensor_name || tank.sensor_id}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No sensor
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
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
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            {isSuper && (
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit user
                              </DropdownMenuItem>
                            )}
                            {isSuper && (
                              <DropdownMenuItem
                                onClick={() => confirmDeleteUser(user)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete user
                              </DropdownMenuItem>
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
                  Showing {paginatedUsers.length} of {filteredUsers.length} users
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
          </CardContent>
        </Card>
      </div>

      <UserModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        mode="add"
        sensors={sensors}
        onSubmit={handleAddUser}
        isLoading={isLoading}
      />

      <UserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        mode="edit"
        user={editingUser}
        sensors={sensors}
        onSubmit={handleUpdateUser}
        isLoading={isLoading}
      />

      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        user={viewingUser}
        sensors={sensors}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}
