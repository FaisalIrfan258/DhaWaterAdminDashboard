"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Calendar, Loader2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const BookingEditModal = ({ isOpen, onClose, booking, onRefresh }) => {
  const [formData, setFormData] = useState({
    admin_id: "",
    tanker_id: "",
    customer_id: "",
    scheduled_date: "",
  });
  const [displayData, setDisplayData] = useState({
    admin_name: "",
    tanker_name: "",
    customer_name: "",
  });
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [tankers, setTankers] = useState([]);
  const [isTankersLoading, setIsTankersLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is super admin
    const userType = Cookies.get("user_type");
    setIsSuper(userType === "superAdmin");
    
    // If not a super admin and modal is open, redirect to dashboard
    if (userType !== "superAdmin" && isOpen) {
      toast.error("You don't have permission to edit bookings");
      onClose();
      router.push("/dashboard");
    }
  }, [isOpen, onClose, router]);

  // Fetch all tankers
  useEffect(() => {
    const fetchTankers = async () => {
      if (!isOpen) return;
      
      setIsTankersLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tankers`);
        if (!response.ok) throw new Error("Failed to fetch tankers");
        const data = await response.json();
        setTankers(data);
      } catch (error) {
        console.error("Error fetching tankers:", error);
        toast.error("Failed to load tankers");
      } finally {
        setIsTankersLoading(false);
      }
    };

    fetchTankers();
  }, [isOpen]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!booking || !isOpen) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/single-booking/${booking.booking_id}`);
        if (!response.ok) throw new Error("Failed to fetch booking details");
        const data = await response.json();
        setBookingDetails(data);
        
        // Format date for datetime-local input
        const formattedDate = formatDateForInput(data.scheduled_date);
        
        // Set form values (IDs for submission)
        setFormData({
          admin_id: data.Admin.admin_id,
          tanker_id: data.Tanker.tanker_id,
          customer_id: data.Customer.customer_id,
          scheduled_date: formattedDate,
        });

        // Set display values (names for display)
        setDisplayData({
          admin_name: data.Admin.full_name,
          tanker_name: data.Tanker.tanker_name,
          customer_name: data.Customer.full_name,
        });
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast.error("Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [booking, isOpen]);

  // Format date for datetime-local input
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleChangeDisplay = (e) => {
    const { name, value } = e.target;
    setDisplayData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTankerChange = (value) => {
    // Update tanker_id in formData
    setFormData((prev) => ({ ...prev, tanker_id: value }));
    
    // Find tanker name for display
    const selectedTanker = tankers.find(t => t.tanker_id.toString() === value.toString());
    if (selectedTanker) {
      setDisplayData((prev) => ({ ...prev, tanker_name: selectedTanker.tanker_name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/update-booking/${booking.booking_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send only IDs to backend
      });

      if (!response.ok) throw new Error("Failed to update booking");
      toast.success("Booking updated successfully!");
      onRefresh(); // Refresh the bookings list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Return null if not a super admin
  if (!isSuper) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Booking
          </DialogTitle>
          <DialogDescription>
            {bookingDetails ? (
              <>Update booking for customer <span className="font-medium">{bookingDetails.Customer.full_name}</span></>
            ) : (
              "Update booking details"
            )}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="admin_name">Admin</Label>
                <Input
                  id="admin_name"
                  name="admin_name"
                  value={displayData.admin_name}
                  onChange={handleChangeDisplay}
                  required
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground">
                  ID: {formData.admin_id}
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tanker_id">Tanker</Label>
                {isTankersLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading tankers...</span>
                  </div>
                ) : (
                  <Select 
                    value={formData.tanker_id.toString()} 
                    onValueChange={handleTankerChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tanker" />
                    </SelectTrigger>
                    <SelectContent>
                      {tankers.map((tanker) => (
                        <SelectItem 
                          key={tanker.tanker_id} 
                          value={tanker.tanker_id.toString()}
                        >
                          {tanker.tanker_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {formData.tanker_id && (
                  <p className="text-xs text-muted-foreground">
                    ID: {formData.tanker_id}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Customer</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={displayData.customer_name}
                  onChange={handleChangeDisplay}
                  required
                  disabled={true}
                />
                <p className="text-xs text-muted-foreground">
                  ID: {formData.customer_id}
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingEditModal; 