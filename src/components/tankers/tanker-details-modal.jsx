"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function TankerDetailsModal({ open, onClose, tanker }) {
  // Function to display phases
  const renderPhases = () => {
    if (!tanker?.phase_id) return "—";
    
    // Handle both array format and TankerPhaseRelations format
    if (Array.isArray(tanker.phase_id)) {
      return (
        <div className="flex flex-wrap gap-1 justify-end">
          {tanker.phase_id.map(phaseId => (
            <Badge key={phaseId} variant="outline">Phase {phaseId}</Badge>
          ))}
        </div>
      );
    } else if (tanker.TankerPhaseRelations && tanker.TankerPhaseRelations.length > 0) {
      return (
        <div className="flex flex-wrap gap-1 justify-end">
          {tanker.TankerPhaseRelations.map(relation => (
            <Badge key={relation.phase_id} variant="outline">
              {relation.Phase?.phase_name || `Phase ${relation.phase_id}`}
            </Badge>
          ))}
        </div>
      );
    }
    
    // Fallback to single phase display
    return tanker.phase_id ? `Phase ${tanker.phase_id}` : "—";
  };

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
            <Label className="font-medium">Price per Gallon (Rs.):</Label>
            <div className="text-right">{tanker?.price_per_gallon || "—"}</div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Cost (Rs.):</Label>
            <div className="text-right">{tanker?.cost || "—"}</div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Availability Status:</Label>
            <div className="text-right">{tanker?.availability_status || tanker?.availability || "—"}</div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-medium">Phases:</Label>
            {renderPhases()}
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
