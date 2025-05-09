import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ViewUserModal({ isOpen, onClose, user, sensors = [] }) {
  if (!user) return null;
  
  // Find the sensor name if available (prioritize sensor_name from WaterTanks)
  let sensorName = "No sensor assigned";
  
  if (user.WaterTanks && user.WaterTanks.length > 0 && user.WaterTanks[0].sensor_name) {
    // Use the sensor_name from WaterTanks if available
    sensorName = user.WaterTanks[0].sensor_name;
  } else if (user.device_id) {
    // Fall back to looking it up in the sensors array
    sensorName = sensors.find(s => s.sensor_id.toString() === user.device_id.toString())?.sensor_name || `Sensor ID: ${user.device_id}`;
  }

  // Format address display
  const formattedAddress = user.street_address 
    ? `${user.street_address}${user.phase_number ? ` Phase ${user.phase_number}` : ''}`
    : user.home_address || "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View user account details
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Full Name:</div>
            <div className="col-span-3">{user.full_name || "N/A"}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Email:</div>
            <div className="col-span-3">{user.email || "N/A"}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Phone:</div>
            <div className="col-span-3">{user.phone_number || "N/A"}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Address:</div>
            <div className="col-span-3">{formattedAddress}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Username:</div>
            <div className="col-span-3">{user.username || "N/A"}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Tank Capacity:</div>
            <div className="col-span-3">{user.tank_capacity || "N/A"}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Balance:</div>
            <div className="col-span-3">{user.balance || "N/A"}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Sensor:</div>
            <div className="col-span-3">{sensorName}</div>
          </div>
          
          {user.created_at && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right font-medium">Created At:</div>
              <div className="col-span-3">
                {new Date(user.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 