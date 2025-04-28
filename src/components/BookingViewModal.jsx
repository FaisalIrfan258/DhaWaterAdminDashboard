"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Truck, FileText } from "lucide-react";

const BookingViewModal = ({ isOpen, onClose, booking }) => {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!booking) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/single-booking/${booking.booking_id}`);
        if (!response.ok) throw new Error("Failed to fetch booking details");
        const data = await response.json();
        setBookingData(data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && booking) {
      fetchBookingDetails();
    }
  }, [isOpen, booking]);

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Booking Details
          </DialogTitle>
          <DialogDescription>
            Viewing details for booking #{booking.booking_id}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 flex justify-center items-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Badge variant={bookingData?.status === "Pending" ? "default" : "success"}>
                {bookingData?.status || booking.status}
              </Badge>
            </div>
            
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Scheduled Date</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData ? new Date(bookingData.scheduled_date).toLocaleString() : new Date(booking.scheduled_date).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData?.Customer?.full_name || booking.Customer?.full_name || "Loading..."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Tanker</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData?.Tanker?.tanker_name || booking.Tanker?.tanker_name || "Loading..."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData?.Admin?.full_name || booking.Admin?.full_name || "Loading..."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Booking Code</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData?.booking_code || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingViewModal;
