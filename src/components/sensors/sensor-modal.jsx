import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function SensorModal({ 
  isOpen, 
  onClose, 
  mode = "view", // "view" | "edit" | "add"
  sensor,
  onSubmit 
}) {
  const defaultFormData = {
    sensor_name: "",
    sensor_details: "",
    manufacturing_date: new Date().toISOString().split('T')[0],
    status: "Active"
  }

  const [formData, setFormData] = useState(mode === "add" ? defaultFormData : sensor || defaultFormData)

  // Update formData when sensor prop changes
  useEffect(() => {
    if (mode === "add") {
      setFormData(defaultFormData)
    } else if (sensor) {
      setFormData(sensor)
    }
  }, [sensor, mode])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const isViewOnly = mode === "view"
  const title = {
    view: "View Sensor",
    edit: "Edit Sensor",
    add: "Add New Sensor"
  }[mode]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isViewOnly 
              ? "View sensor details" 
              : "Fill in the information for the sensor"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sensor_name" className="text-right">
                Name
              </Label>
              <Input
                id="sensor_name"
                value={formData.sensor_name}
                onChange={(e) => setFormData({ ...formData, sensor_name: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sensor_details" className="text-right">
                Details
              </Label>
              <Input
                id="sensor_details"
                value={formData.sensor_details}
                onChange={(e) => setFormData({ ...formData, sensor_details: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manufacturing_date" className="text-right">
                Mfg. Date
              </Label>
              <Input
                id="manufacturing_date"
                type="date"
                value={formData.manufacturing_date}
                onChange={(e) => setFormData({ ...formData, manufacturing_date: e.target.value })}
                className="col-span-3"
                disabled={isViewOnly}
                required
              />
            </div>
            {mode !== "add" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Input
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="col-span-3"
                  disabled={isViewOnly}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {!isViewOnly && (
              <Button type="submit">
                {mode === "add" ? "Add Sensor" : "Save Changes"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 