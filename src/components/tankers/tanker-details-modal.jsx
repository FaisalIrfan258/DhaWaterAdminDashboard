"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function TankerDetailsModal({ open, onClose, tanker }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>Tanker Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div>
            <Label>Tanker Name</Label>
            <Input className="mt-2" value={tanker?.tanker_name || ""} readOnly />
          </div>
          <div>
            <Label>Plate Number</Label>
            <Input className="mt-2" value={tanker?.plate_number || ""} readOnly />
          </div>
          <div>
            <Label>Capacity (Gallons)</Label>
            <Input className="mt-2" value={tanker?.capacity ?? ""} readOnly />
          </div>
          <div>
            <Label>Price per Liter (Rs.)</Label>
            <Input className="mt-2" value={tanker?.price_per_liter ?? ""} readOnly />
          </div>
          <div>
            <Label>Cost (Rs.)</Label>
            <Input className="mt-2" value={tanker?.cost ?? ""} readOnly />
          </div>
          <div>
            <Label>Availability Status</Label>
            <Input className="mt-2" value={tanker?.availability_status || ""} readOnly />
          </div>
          <div>
            <Label>Phase ID</Label>
            <Input className="mt-2" value={tanker?.phase_id ?? ""} readOnly />
          </div>
          <div>
            <Label>Assigned Driver ID</Label>
            <Input className="mt-2" value={tanker?.assigned_driver_id ?? ""} readOnly />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
