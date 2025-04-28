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

const BookingEditModal = ({ isOpen, onClose, booking, onRefresh }) => {
  const [formData, setFormData] = useState({
    admin_id: "",
    tanker_id: "",
    customer_id: "",
    scheduled_date: "",
  });
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
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
        
        // Set form values
        setFormData({
          admin_id: data.Admin.admin_id,
          tanker_id: data.Tanker.tanker_id,
          customer_id: data.Customer.customer_id,
          scheduled_date: formattedDate,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        body: JSON.stringify(formData),
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
                <Label htmlFor="admin_id">Admin</Label>
                <Input
                  id="admin_id"
                  name="admin_id"
                  value={formData.admin_id}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                {bookingDetails && (
                  <p className="text-xs text-muted-foreground">
                    Current: {bookingDetails.Admin.full_name}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tanker_id">Tanker</Label>
                <Input
                  id="tanker_id"
                  name="tanker_id"
                  value={formData.tanker_id}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                {bookingDetails && (
                  <p className="text-xs text-muted-foreground">
                    Current: {bookingDetails.Tanker.tanker_name}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="customer_id">Customer</Label>
                <Input
                  id="customer_id"
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                {bookingDetails && (
                  <p className="text-xs text-muted-foreground">
                    Current: {bookingDetails.Customer.full_name}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
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