"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"

export function TankerModal({ open, onClose, tanker, onSubmit }) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      tanker_name: "",
      plate_number: "",
      capacity: "",
      price_per_liter: "",
      cost: "",
      availability: "Available",
    }
  })

  useEffect(() => {
    if (tanker) {
      reset({
        tanker_name: tanker.tanker_name,
        plate_number: tanker.plate_number,
        capacity: tanker.capacity,
        price_per_liter: tanker.price_per_liter,
        cost: tanker.cost,
        availability: tanker.availability_status,
      })
    } else {
      reset({
        tanker_name: "",
        plate_number: "",
        capacity: "",
        price_per_liter: "",
        cost: "",
        availability: "Available",
      })
    }
  }, [tanker, reset])

  const onSubmitHandler = (data) => {
    console.log("Submitting data:", data);
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tanker ? 'Edit Tanker' : 'Add New Tanker'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          <div>
            <Label>Tanker Name</Label>
            <Input {...register("tanker_name", { required: true })} />
            {errors.tanker_name && <p className="text-red-500">Tanker name is required</p>}
          </div>
          <div>
            <Label>Plate Number</Label>
            <Input {...register("plate_number", { required: true })} />
            {errors.plate_number && <p className="text-red-500">Plate number is required</p>}
          </div>
          <div>
            <Label>Capacity (Liters)</Label>
            <Input type="number" {...register("capacity", { required: true })} />
            {errors.capacity && <p className="text-red-500">Capacity is required</p>}
          </div>
          <div>
            <Label>Price per Liter (Rs.)</Label>
            <Input type="number" {...register("price_per_liter", { required: true })} />
            {errors.price_per_liter && <p className="text-red-500">Price per liter is required</p>}
          </div>
          <div>
            <Label>Cost (Rs.)</Label>
            <Input type="number" {...register("cost", { required: true })} />
            {errors.cost && <p className="text-red-500">Cost is required</p>}
          </div>
          <div>
            <Label>Availability</Label>
            <Controller
              name="availability"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.availability && <p className="text-red-500">Availability is required</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {tanker ? 'Update Tanker' : 'Add Tanker'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}