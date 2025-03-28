"use client"

import { useState, useEffect } from "react"
import AdminList from "@/components/dashboard/admin-list"
import { toast } from 'sonner'
import { Modal } from "@/components/ui/modal"

export default function AdminManagementPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [admins, setAdmins] = useState([]) // State to hold the list of admins
  const [selectedAdmin, setSelectedAdmin] = useState(null) // State to hold the admin being edited
  const [isModalOpen, setIsModalOpen] = useState(false) // State to control modal visibility

  // Define the base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Ensure this is set in your environment variables

  // Fetch admins on component mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/superadmin/view-admins`);
        const data = await response.json();
        const sortedAdmins = [...data.admins].sort((a, b) => a.full_name.localeCompare(b.full_name));
        setAdmins(sortedAdmins); // Set the sorted admins from the fetched data
      } catch (error) {
        console.error('Error fetching admins:', error);
        toast.error('Failed to fetch admins');
      }
    };

    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    const payload = {
      full_name: fullName,
      email: email,
      password: password,
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
    }
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return; // Ensure there's a selected admin

    const payload = {
      admin_id: selectedAdmin,
      full_name: fullName,
      email: email,
      password: password,
    };

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
      await fetchAdmins(); // Re-fetch admins after updating
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update admin');
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setSelectedAdmin(null); // Reset selected admin
    setIsModalOpen(false); // Close the modal
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      const response = await fetch(`${baseUrl}/api/superadmin/delete-admin?admin_id=${adminId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete admin');

      toast.success('Admin deleted successfully');
      await fetchAdmins(); // Re-fetch admins after deletion
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete admin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
        <button 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          Add New Admin
        </button>
      </div>

      <AdminList 
        admins={admins} 
        onEdit={(admin) => {
          setFullName(admin.full_name);
          setEmail(admin.email);
          setPassword(""); // Clear password for security
          setSelectedAdmin(admin.admin_id); // Set the selected admin for editing
          setIsModalOpen(true); // Open the modal
        }} 
        onDelete={handleDeleteAdmin} 
      />

      <Modal isOpen={isModalOpen} onClose={resetForm} title={selectedAdmin ? "Edit Admin" : "Add New Admin"}>
        <form onSubmit={selectedAdmin ? handleUpdateAdmin : handleAddAdmin}>
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {selectedAdmin ? "Update Admin" : "Create Admin"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

