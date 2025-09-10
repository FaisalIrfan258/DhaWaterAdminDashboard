import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { complaintService } from "@/services";
import { queryKeys } from "@/lib/queryClient";

// Get all complaints
export const useComplaints = () => {
  return useQuery({
    queryKey: queryKeys.complaints.all(),
    queryFn: () => complaintService.getAllComplaints(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get complaint by ID
export const useComplaint = (complaintId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.complaints.byId(complaintId),
    queryFn: () => complaintService.getComplaintById(complaintId),
    enabled: !!complaintId, // Only run if complaintId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Update complaint remarks mutation
export const useUpdateComplaintRemarks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ complaintId, remarksData }) =>
      complaintService.updateComplaintRemarks(complaintId, remarksData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch complaints
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.complaints.byId(variables.complaintId),
      });

      toast.success("Complaint updated successfully", {
        description: "The complaint remarks have been updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating complaint remarks:", error);
      toast.error("Failed to update complaint", {
        description:
          error?.response?.data?.message || "Please try again later.",
      });
    },
  });
};
