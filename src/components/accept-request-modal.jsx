"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal"; // Adjust the import path as necessary
import { Button } from "@/components/ui/button"; // Adjust the import path as necessary
import { toast } from "sonner";

const AcceptRequestModal = ({ isOpen, onClose, requestId, customerId }) => {
  const [tankers, setTankers] = useState([]);
  const [selectedTankerId, setSelectedTankerId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  useEffect(() => {
    const fetchTankers = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Ensure this is set in your environment variables
      try {
        const response = await fetch(`${baseUrl}/api/tankers`);
        if (!response.ok) throw new Error("Failed to fetch tankers");
        const data = await response.json();
        setTankers(data); // Assuming the API returns an array of tankers
      } catch (error) {
        console.error("Error fetching tankers:", error);
        toast.error("Failed to load tankers");
      }
    };

    if (isOpen) {
      fetchTankers();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct the request body
    const requestBody = {
      tanker_id: parseInt(selectedTankerId), // Ensure tanker_id is an integer
      request_id: requestId,
      customer_id: customerId,
      schedule_date: scheduledDate,
    };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Ensure this is set in your environment variables
      const response = await fetch(`${baseUrl}/api/bookings/approve-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to approve request");
      }

      const result = await response.json();
      console.log("Request approved:", result);
      toast.success("Request approved successfully!");
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Accept Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Tanker ID</label>
          <select
            value={selectedTankerId}
            onChange={(e) => setSelectedTankerId(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select a tanker</option>
            {tankers.map((tanker) => (
              <option key={tanker.tanker_id} value={tanker.tanker_id}>
                {tanker.tanker_name} (ID: {tanker.tanker_id}) {/* Adjust based on your tanker object structure */}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Scheduled Date</label>
          <input
            type="datetime-local" // Use datetime-local for better date input
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Request ID</label>
          <input
            type="text"
            value={requestId}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Customer ID</label>
          <input
            type="text"
            value={customerId}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="bg-primary text-white">
            Accept
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AcceptRequestModal; 