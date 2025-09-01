"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useSensors } from "@/hooks";
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
import { useUser } from "@/context/UserContext";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function UsersPage() {
  const { user } = useUser();
  const { data: usersData, isLoading, error, refetch } = useUsers();
  const { data: sensorsData } = useSensors();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Extract data from React Query responses with memoization
  const users = useMemo(() => usersData?.users || [], [usersData]);
  const sensors = useMemo(() => sensorsData?.sensors || [], [sensorsData]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const [isSuper, setIsSuper] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = useMemo(() => Math.ceil(filteredUsers.length / itemsPerPage), [filteredUsers, itemsPerPage]);

  const paginatedUsers = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredUsers, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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

  // Format users data from React Query
  const formattedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    
    // Sort users by created_at in descending order
    const sortedUsers = [...users].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    // Update to include all relevant fields
    return sortedUsers.map((user) => {
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
        WaterTanks: user.WaterTanks?.map((tank) => ({
          sensor_id: tank.sensor_id, // Map sensor_id from WaterTanks
          sensor_name: tank.Sensor?.sensor_name || `Sensor ${tank.sensor_id}` // Include sensor name
        })) || [],
        userType: user.UserType?.type, // Include user type
        userTypeDescription: user.UserType?.description, // Include user type description
      };
    });
  }, [users]);



  // Handle search
  const handleSearch = useCallback((e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  }, []);

  // Add new user
  const handleAddUser = async (userData) => {
    try {
      await createUserMutation.mutateAsync(userData);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      // Error handling is done in the hook
    }
  };

  // Update existing user
  const handleUpdateUser = async (userData) => {
    try {
      await updateUserMutation.mutateAsync({ userId: userData.customer_id, userData });
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      // Error handling is done in the hook
    }
  };

  // Handle user edit
  const handleEditUser = async (user) => {
    setIsLoading(true);
    try {
      const data = await userService.getUserProfile(user.customer_id);

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
  const handleViewUser = useCallback((user) => {
    router.push(`/dashboard/users/${user.customer_id}`);
  }, [router]);

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

    try {
      await deleteUserMutation.mutateAsync(userToDelete.customer_id);
    } catch (error) {
      console.error("Error deleting user:", error);
      // Error handling is done in the hook
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingUser(null);
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show error state
  if (error) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Users" text="Manage system users and their information.">
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </DashboardHeader>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {error?.message || "Failed to load users. Please try again."}
            </p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Try Again"}
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }



  // Initialize filtered users when formattedUsers changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(formattedUsers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = formattedUsers.filter(
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
  }, [formattedUsers, searchQuery]);

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
    if (user?.user_type) {
      setIsSuper(user.user_type === "superAdmin");
    }
  }, [user]);

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
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" modal={false}>
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
                  key="items-per-page-select"
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
        isLoading={createUserMutation.isPending}
      />

      <UserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        mode="edit"
        user={editingUser}
        sensors={sensors}
        onSubmit={handleUpdateUser}
        isLoading={updateUserMutation.isPending}
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
