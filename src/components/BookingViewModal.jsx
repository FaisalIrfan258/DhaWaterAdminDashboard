"use client";
import React from "react";
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogFooter
} from "@/components/ui/dialog"; // Adjust the import path as necessary
import { Button } from "@/components/ui/button";
const BookingViewModal = ({ isOpen, onClose, booking }) => {
if (!booking) return null;
return (
<Dialog open={isOpen} onOpenChange={onClose}>
<DialogContent className="sm:max-w-[500px]">
<DialogHeader>
<DialogTitle>Booking Details</DialogTitle>
<DialogDescription>
View booking details
</DialogDescription>
</DialogHeader>
<div className="grid gap-4 py-4">
<div className="grid grid-cols-4 items-center gap-4">
<div className="text-right font-medium">Status:</div>
<div className="col-span-3">{booking.status}</div>
</div>
<div className="grid grid-cols-4 items-center gap-4">
<div className="text-right font-medium">Scheduled Date:</div>
<div className="col-span-3">{new Date(booking.scheduled_date).toLocaleString()}</div>
</div>
<div className="grid grid-cols-4 items-center gap-4">
<div className="text-right font-medium">Customer ID:</div>
<div className="col-span-3">{booking.customer_id}</div>
</div>
<div className="grid grid-cols-4 items-center gap-4">
<div className="text-right font-medium">Tanker ID:</div>
<div className="col-span-3">{booking.tanker_id}</div>
</div>
<div className="grid grid-cols-4 items-center gap-4">
<div className="text-right font-medium">Request ID:</div>
<div className="col-span-3">{booking.request_id}</div>
</div>
</div>
<DialogFooter>
<Button onClick={onClose}>Close</Button>
</DialogFooter>
</DialogContent>
</Dialog>
);
};
export default BookingViewModal;
