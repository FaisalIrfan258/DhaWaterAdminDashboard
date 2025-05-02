"use client"

import { useState, useEffect } from "react"
import AdminList from "@/components/dashboard/admin-list"
import { toast } from 'sonner'
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"

export default function AdminManagementPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("")
  const [admins, setAdmins] = useState([])
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedAdmins, setPaginatedAdmins] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  // Define the base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Apply pagination whenever admins list or pagination settings change
  useEffect(() => {
    paginateAdmins();
  }, [admins, currentPage, itemsPerPage]);

  const paginateAdmins = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAdmins = admins.slice(indexOfFirstItem, indexOfLastItem);
    
    setPaginatedAdmins(currentAdmins);
    setTotalPages(Math.ceil(admins.length / itemsPerPage));
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

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/superadmin/view-admins`);
      const data = await response.json();
      const sortedAdmins = [...data.admins].sort((a, b) => a.full_name.localeCompare(b.full_name));
      setAdmins(sortedAdmins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!fullName || !email || !password || !userType) {
      toast.error('Please fill all required fields');
      setIsLoading(false);
      return;
    }

    const payload = {
      full_name: fullName,
      email: email,
      password: password,
      user_type: userType
    };

    try {
      const response = await fetch(`${baseUrl}/api/superadmin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create admin');

      toast.success('Admin created successfully');
      resetForm();
      await fetchAdmins();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setIsLoading(true);

    if (!fullName || !email || !userType) {
      toast.error('Please fill all required fields');
      setIsLoading(false);
      return;
    }

    const payload = {
      admin_id: selectedAdmin,
      full_name: fullName,
      email: email,
      user_type: userType
    };

    // Only include password if it was changed
    if (password) {
      payload.password = password;
    }

    try {
      const response = await fetch(`${baseUrl}/api/superadmin/update-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update admin');

      toast.success('Admin updated successfully');
      resetForm();
      await fetchAdmins();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update admin');
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/superadmin/delete-admin?admin_id=${adminId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete admin');

      toast.success('Admin deleted successfully');
      await fetchAdmins();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin) => {
    setFullName(admin.full_name);
    setEmail(admin.email);
    setPassword(""); // Clear password for security
    setUserType(admin.UserType?.description || "Admin"); 
    setSelectedAdmin(admin.admin_id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Admin Management</CardTitle>
          <Button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Admin
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="flex justify-center py-6">Loading administrators...</div>}
          {!isLoading && (
            <>
              <AdminList 
                admins={paginatedAdmins} 
                onEdit={handleOpenEditModal} 
                onDelete={handleDeleteAdmin} 
              />
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">
                    Showing {paginatedAdmins.length} of {admins.length} admins
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm} 
        title={selectedAdmin ? "Edit Administrator" : "Add New Administrator"}
      >
        <form onSubmit={selectedAdmin ? handleUpdateAdmin : handleAddAdmin} className="space-y-4 p-1">
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
              {selectedAdmin ? "Password (leave blank to keep current)" : "Password"}
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
            <Select
              value={userType}
              onValueChange={setUserType}
              required
            >
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
            <Button 
              type="button" 
              onClick={resetForm}
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : (selectedAdmin ? "Update Administrator" : "Add Administrator")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

