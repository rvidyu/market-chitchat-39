
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
      toast({
        title: "Error",
        description: "Failed to mark messages as read.",
        variant: "destructive",
      });
    },
  });

  // Function to handle marking messages as read in a conversation
  const handleMarkMessagesAsRead = (conversationId: string) => {
    if (!conversationId) return;
    
    markAsReadMutation.mutate(conversationId);
  };

  return {
    handleMarkMessagesAsRead,
    isMarking: markAsReadMutation.isPending
  };
};
