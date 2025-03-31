
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markMessagesAsRead } from "@/data/api";

export const useMessageReading = () => {
  const queryClient = useQueryClient();

  // Handle marking messages as read
  const markAsReadMutation = useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: () => {
      // Use focused invalidation to only update the needed data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error("Error marking messages as read:", error);
    }
  });

  const handleMarkMessagesAsRead = (conversationId: string) => {
    if (!conversationId) return;
    
    console.log("Marking messages as read for conversation:", conversationId);
    markAsReadMutation.mutate(conversationId);
  };

  return {
    handleMarkMessagesAsRead,
    isMarkingAsRead: markAsReadMutation.isPending
  };
};
