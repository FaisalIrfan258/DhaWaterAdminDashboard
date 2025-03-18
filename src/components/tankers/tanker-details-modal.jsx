"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function TankerDetailsModal({ open, onClose, tanker }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tanker Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tanker Name</Label>
            <Input value={tanker?.tanker_name} readOnly />
          </div>
          <div>
            <Label>Plate Number</Label>
            <Input value={tanker?.plate_number} readOnly />
          </div>
          <div>
            <Label>Capacity (Liters)</Label>
            <Input value={tanker?.capacity} readOnly />
          </div>
          <div>
            <Label>Price per Liter (Rs.)</Label>
            <Input value={tanker?.price_per_liter} readOnly />
          </div>
          <div>
            <Label>Cost (Rs.)</Label>
            <Input value={tanker?.cost} readOnly />
          </div>
          <div>
            <Label>Availability Status</Label>
            <Input value={tanker?.availability_status} readOnly />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 