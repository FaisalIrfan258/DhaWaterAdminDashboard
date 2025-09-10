"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/common/pagination";
import { PlusCircle, Eye, Pencil, Trash2 } from "lucide-react";
import {
  useAdmins,
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,
  usePagination,
} from "@/hooks";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/common/search-input";
import {
  DataTable,
  commonActions,
  badgeVariants,
} from "@/components/common/data-table";

function AdminManagementPageContent() {
  const router = useRouter();

  // React Query hooks
  const { data, isLoading, error, refetch } = useAdmins();
  const admins = Array.isArray(data?.admins) ? data.admins : [];
  const createAdminMutation = useCreateAdmin();
  const updateAdminMutation = useUpdateAdmin();
  const deleteAdminMutation = useDeleteAdmin();

  // Search functionality
  const {
    searchQuery,
    filteredData: filteredAdmins,
    handleSearch,
    clearSearch,
  } = useSearch(admins, ["full_name", "email", "UserType.description"], {
    resetPageOnSearch: true,
  });

  // Pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedAdmins,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(filteredAdmins, 10);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({ isSuper: false });
  const [isSuper, setIsSuper] = useState(false);

  // Check user permissions
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsSuper(parsedUser.isSuper || parsedUser.user_type === "superAdmin");
    }
  }, []);

  const handleRefresh = async () => {
    await refetch();
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !userType) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      full_name: fullName,
      email: email,
      password: password,
      user_type: userType,
    };

    try {
      await createAdminMutation.mutateAsync(payload);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    if (!fullName || !email || !userType) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      full_name: fullName,
      email: email,
      user_type: userType,
    };

    // Only include password if it was changed
    if (password) {
      payload.password = password;
    }

    try {
      await updateAdminMutation.mutateAsync({
        adminId: selectedAdmin,
        adminData: payload,
      });
      resetForm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setUserType("");
    setSelectedAdmin(null);
    setIsModalOpen(false);
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      await deleteAdminMutation.mutateAsync(adminId);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleOpenAddModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const handleOpenEditModal = useCallback((admin) => {
    setFullName(admin.full_name);
    setEmail(admin.email);
    setPassword(""); // Clear password for security
    setUserType(admin.UserType?.description || "Admin");
    setSelectedAdmin(admin.admin_id);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Admin Management</CardTitle>
          <div className="flex items-center gap-4">
            <SearchInput
              placeholder="Search admins..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <Button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add New Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-6">
              Loading administrators...
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center py-6 space-y-4">
              <p className="text-red-600">Failed to load administrators</p>
              <Button onClick={handleRefresh} variant="outline">
                Retry
              </Button>
            </div>
          )}
          {!isLoading && !error && (
            <>
              <DataTable
                data={paginatedAdmins}
                columns={[
                  {
                    key: "admin_id",
                    header: "ID",
                    accessor: "admin_id",
                    cellClassName: "font-medium",
                  },
                  {
                    key: "full_name",
                    header: "Full Name",
                    accessor: "full_name",
                  },
                  {
                    key: "email",
                    header: "Email",
                    accessor: "email",
                  },
                  {
                    key: "user_type",
                    header: "User Type",
                    render: (_, admin) => (
                      <Badge
                        variant={
                          admin.UserType?.description === "superAdmin"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          admin.UserType?.description === "superAdmin"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }
                      >
                        {admin.UserType?.description || "Admin"}
                      </Badge>
                    ),
                  },
                ]}
                actions={
                  isSuper
                    ? [
                        commonActions.edit((admin) =>
                          handleOpenEditModal(admin)
                        ),
                        {
                          label: "Delete Admin",
                          icon: Trash2,
                          onClick: (admin) => handleDeleteAdmin(admin.admin_id),
                          variant: "destructive",
                        },
                      ]
                    : []
                }
                isLoading={isLoading}
                emptyMessage="No administrators found"
                searchQuery={searchQuery}
                searchEmptyMessage="No administrators found matching your search"
                className="mt-4"
              />

              {/* Pagination Controls */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={selectedAdmin ? "Edit Administrator" : "Add New Administrator"}
      >
        <form
          onSubmit={selectedAdmin ? handleUpdateAdmin : handleAddAdmin}
          className="space-y-4 p-1"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {selectedAdmin
                ? "Password (leave blank to keep current)"
                : "Password"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={selectedAdmin ? "••••••••" : "Enter password"}
              required={!selectedAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType">User Type</Label>
            <Select value={userType} onValueChange={setUserType} required>
              <SelectTrigger id="userType">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" onClick={resetForm} variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                createAdminMutation.isPending || updateAdminMutation.isPending
              }
            >
              {createAdminMutation.isPending || updateAdminMutation.isPending
                ? "Processing..."
                : selectedAdmin
                ? "Update Administrator"
                : "Add Administrator"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function AdminManagementPage() {
  return (
    <ProtectedRoute requireSuperAdmin={true}>
      <AdminManagementPageContent />
    </ProtectedRoute>
  );
}
