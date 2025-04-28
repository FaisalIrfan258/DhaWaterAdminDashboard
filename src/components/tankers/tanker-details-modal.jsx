"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
          <div className="flex items-center justify-between">
            <Label className="font-medium">Tanker Name:</Label>
            <div className="text-right">{tanker?.tanker_name || "—"}</div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Plate Number:</Label>
            <div className="text-right">{tanker?.plate_number || "—"}</div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Capacity (Gallons):</Label>
            <div className="text-right">{tanker?.capacity || "—"}</div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Price per Liter (Rs.):</Label>
            <div className="text-right">{tanker?.price_per_liter || "—"}</div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Cost (Rs.):</Label>
            <div className="text-right">{tanker?.cost || "—"}</div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Availability Status:</Label>
            <div className="text-right">{tanker?.availability_status || "—"}</div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Phase:</Label>
            <div className="text-right">
              {tanker?.TankerPhaseRelations && tanker.TankerPhaseRelations[0]?.Phase?.phase_name 
                ? `${tanker.TankerPhaseRelations[0].Phase.phase_name}`
                : "—"}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Assigned Driver:</Label>
            <div className="text-right">{tanker?.Driver?.full_name || "—"}</div>
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
