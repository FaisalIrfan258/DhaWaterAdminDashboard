"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"

export function TankerModal({ open, onClose, tanker, onSubmit }) {
  const [drivers, setDrivers] = useState([])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tanker_name: "",
      plate_number: "",
      capacity: "",
      price_per_liter: "",
      cost: "",
      availability_status: "Available",
      phase_id: "",
      assigned_driver_id: "",
    },
  })
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

  // Reset form when tanker prop changes
  useEffect(() => {
    if (tanker) {
      reset({
        tanker_name: tanker.tanker_name,
        plate_number: tanker.plate_number,
        capacity: tanker.capacity,
        price_per_liter: tanker.price_per_liter,
        cost: tanker.cost,
        availability_status: tanker.availability_status,
        phase_id: tanker.phase_id,
        assigned_driver_id: tanker.assigned_driver_id
          ? String(tanker.assigned_driver_id)
          : "",
      })
    } else {
      reset({
        tanker_name: "",
        plate_number: "",
        capacity: "",
        price_per_liter: "",
        cost: "",
        availability_status: "Available",
        phase_id: "",
        assigned_driver_id: "",
      })
    }
  }, [tanker, reset])

  // Fetch available drivers when modal opens
  useEffect(() => {
    if (!open) return

    fetch(`${API_BASE_URL}/api/driver/all`)
      .then((res) => res.json())
      .then((data) => {
        // only keep those with availability_status === "Available"
        const available = data.filter(
          (d) => d.availability_status === "Available"
        )
        setDrivers(available)
        console.log("Available drivers:", available) // Debug log
      })
      .catch((err) => console.error("Failed to load drivers", err))
  }, [open])

  const onSubmitHandler = (data) => {
    // Convert assigned_driver_id from string to number if it exists
    if (data.assigned_driver_id) {
      data.assigned_driver_id = Number(data.assigned_driver_id);
    }
    
    console.log("Submitting data:", data);
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>{tanker ? "Edit Tanker" : "Add New Tanker"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmitHandler)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4">
            {/* Tanker Name */}
            <div>
              <Label>Tanker Name</Label>
              <Input
                className="mt-2"
                {...register("tanker_name", { required: true })}
              />
              {errors.tanker_name && (
                <p className="text-red-500">Tanker name is required</p>
              )}
            </div>

            {/* Plate Number */}
            <div>
              <Label>Plate Number</Label>
              <Input
                className="mt-2"
                {...register("plate_number", { required: true })}
              />
              {errors.plate_number && (
                <p className="text-red-500">Plate number is required</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <Label>Capacity (Gallons)</Label>
              <Input
                className="mt-2"
                type="number"
                {...register("capacity", { required: true })}
              />
              {errors.capacity && (
                <p className="text-red-500">Capacity is required</p>
              )}
            </div>

            {/* Price per Gallon */}
            <div>
              <Label>Price per Gallon (Rs.)</Label>
              <Input
                className="mt-2"
                type="number"
                step="0.01"
                {...register("price_per_liter", { required: true })}
              />
              {errors.price_per_liter && (
                <p className="text-red-500">
                  Price per Gallon is required
                </p>
              )}
            </div>

            {/* Cost */}
            <div>
              <Label>Cost (Rs.)</Label>
              <Input
                className="mt-2"
                type="number"
                step="0.01"
                {...register("cost", { required: true })}
              />
              {errors.cost && (
                <p className="text-red-500">Cost is required</p>
              )}
            </div>

            {/* Availability */}
            <div>
              <Label>Availability</Label>
              <Controller
                name="availability_status"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">
                        Available
                      </SelectItem>
                      <SelectItem value="Unavailable">
                        Unavailable
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.availability_status && (
                <p className="text-red-500">Availability is required</p>
              )}
            </div>

            {/* Phase ID */}
            <div>
              <Label>Phase ID</Label>
              <Input
                className="mt-2"
                type="number"
                {...register("phase_id", { required: true })}
              />
              {errors.phase_id && (
                <p className="text-red-500">Phase ID is required</p>
              )}
            </div>

            {/* Assign Driver */}
            <div>
              <Label>Assign Driver</Label>
              <Controller
                name="assigned_driver_id"
                control={control}
                rules={{ required: true }}  
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select Driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((d) => (
                        <SelectItem
                          key={d.driver_id}
                          value={String(d.driver_id)}
                        >
                          {d.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assigned_driver_id && (
                <p className="text-red-500">Driver assignment is required</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {tanker ? "Update Tanker" : "Add Tanker"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}