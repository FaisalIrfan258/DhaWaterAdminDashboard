"use client"

import { useState } from "react"
import AdminList from "@/components/dashboard/admin-list"
import { toast } from 'sonner'

export default function AdminManagementPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Define the base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Ensure this is set in your environment variables

  const handleAddAdmin = async (e) => {
    e.preventDefault() // Prevent the default form submission

    const payload = {
      full_name: fullName,
      email: email,
      password: password,
    }

    try {
      const response = await fetch(`${baseUrl}/api/superadmin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to create admin')

      toast.success('Admin created successfully')
      // Optionally, reset the form fields
      setFullName("")
      setEmail("")
      setPassword("")
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create admin')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
        <button 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          onClick={() => document.getElementById('add-admin-form').classList.toggle('hidden')}
        >
          Add New Admin
        </button>
      </div>

      <form id="add-admin-form" className="hidden space-y-4" onSubmit={handleAddAdmin}>
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
            Create Admin
          </button>
        </div>
      </form>

      <AdminList />
    </div>
  )
}

