
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { markMessagesAsRead } from "@/data/api/readStatusApi";

export const useMessageReading = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up mutation for marking messages as read
  const markAsReadMutation = useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: () => {
      // After successfully marking messages as read, invalidate the conversations query
      // to refresh the data and update unread counts
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error("Error marking messages as read:", error);
      // Show a more user-friendly error message
      toast({
        title: "Error",
        description: "Could not update read status. Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Function to handle marking messages as read in a conversation
  const handleMarkMessagesAsRead = (conversationId: string) => {
    if (!conversationId) {
      console.warn("Cannot mark messages as read: No conversation ID provided");
      return;
    }
    
    // Don't validate the format - let the API handle it
    console.log("Marking messages as read for conversation:", conversationId);
    markAsReadMutation.mutate(conversationId);
  };

  return {
    handleMarkMessagesAsRead,
    isMarking: markAsReadMutation.isPending
  };
};
