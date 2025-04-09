import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function UserModal({ 
  isOpen, 
  onClose,
  mode = "add", // "add" | "edit" | "view"
  user = null,
  onSubmit,
  isLoading 
}) {
  const defaultFormData = {
    full_name: "",
    email: "",
    phone_number: "",
    home_address: "",
    username: "",
    password: "",
    tank_capacity: "",
    balance: "",
    device_id: ""
  }

  const [formData, setFormData] = useState(defaultFormData)
  const [sensors, setSensors] = useState([])
  const [isSensorDropdownOpen, setIsSensorDropdownOpen] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Ensure this is set in your environment variables


  useEffect(() => {
    if (mode === "edit" && user) {
      setFormData({
        ...user,
        device_id: user.WaterTanks?.[0]?.sensor_id?.toString() || "",
        password: "" // Clear password when editing
      })
    } else if (mode === "add") {
      setFormData(defaultFormData)
    }
  }, [mode, user])

  const fetchAvailableSensors = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/sensor/available-sensors`)
      if (!response.ok) throw new Error("Failed to fetch available sensors")
      
      const data = await response.json()
      // Filter sensors to only include those that are "Not Assigned"
      const notAssignedSensors = data.sensors.filter(sensor => sensor.status === "Not Assigned")
      setSensors(notAssignedSensors) // Set the available sensors
    } catch (error) {
      console.error("Error fetching available sensors:", error)
    }
  }

  const handleSensorDropdownOpen = () => {
    if (!isSensorDropdownOpen) {
      fetchAvailableSensors()
    }
    setIsSensorDropdownOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      tank_capacity: Number(formData.tank_capacity),
      balance: Number(formData.balance),
      device_id: Number(formData.device_id)
    }

    if (mode === "edit") {
      submitData.customer_id = user.customer_id
      // Only include password if it was changed
      if (!submitData.password) {
        delete submitData.password
      }
    }

    onSubmit(submitData)
  }

  const isViewOnly = mode === "view"
  const title = {
    add: "Add New User",
    edit: "Edit User",
    view: "User Details"
  }[mode]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isViewOnly 
              ? "View user account details" 
              : mode === "edit"
              ? "Edit user account information"
              : "Fill in the details to create a new user account"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">
                Phone
              </Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="home_address" className="text-right">
                Address
              </Label>
              <Input
                id="home_address"
                value={formData.home_address}
                onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>

            {!isViewOnly && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {mode === "edit" ? "New Password" : "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="col-span-3"
                  required={mode === "add"}
                  placeholder={mode === "edit" ? "Leave blank to keep current" : ""}
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tank_capacity" className="text-right">
                Tank Capacity
              </Label>
              <Input
                id="tank_capacity"
                type="number"
                value={formData.tank_capacity}
                onChange={(e) => setFormData({ ...formData, tank_capacity: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Balance
              </Label>
              <Input
                id="balance"
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="device_id" className="text-right">
                Sensor
              </Label>
              <Select
                value={formData.device_id}
                onValueChange={(value) => setFormData({ ...formData, device_id: value })}
                onOpenChange={handleSensorDropdownOpen}
                disabled={isViewOnly}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a sensor" />
                </SelectTrigger>
                <SelectContent>
                  {sensors.map((sensor) => (
                    <SelectItem key={sensor.sensor_id} value={sensor.sensor_id.toString()}>
                      {sensor.sensor_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {isViewOnly ? "Close" : "Cancel"}
            </Button>
            {!isViewOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2">{mode === "edit" ? "Updating..." : "Creating..."}</span>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  mode === "edit" ? "Update User" : "Add User"
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 