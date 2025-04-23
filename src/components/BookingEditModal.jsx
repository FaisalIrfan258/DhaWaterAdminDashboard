"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal"; // Adjust the import path as necessary
import { Button } from "@/components/ui/button"; // Adjust the import path as necessary
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const BookingEditModal = ({ isOpen, onClose, booking, onRefresh }) => {
  const [formData, setFormData] = useState({
    admin_id: "",
    tanker_id: "",
    customer_id: "",
    scheduled_date: "",
  });
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
    if (booking) {
      setFormData({
        admin_id: booking.admin_id,
        tanker_id: booking.tanker_id,
        customer_id: booking.customer_id,
        scheduled_date: booking.scheduled_date,
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  // Return null if not a super admin
  if (!isSuper) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Booking">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Admin ID</label>
          <input
            type="text"
            name="admin_id"
            value={formData.admin_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Tanker ID</label>
          <input
            type="text"
            name="tanker_id"
            value={formData.tanker_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Customer ID</label>
          <input
            type="text"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Scheduled Date</label>
          <input
            type="datetime-local"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit">Update Booking</Button>
      </form>
    </Modal>
  );
};

export default BookingEditModal; 