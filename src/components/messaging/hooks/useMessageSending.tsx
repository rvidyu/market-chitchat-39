
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { sendMessage } from "@/data/api";
import { supabase } from "@/integrations/supabase/client";

export const useMessageSending = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle sending a new message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, text, images }: { 
      recipientId: string; 
      text: string; 
      images?: File[];
    }) => {
      // Handle image uploads
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        // For future implementation: process images more efficiently
        for (const image of images) {
          const imageUrl = URL.createObjectURL(image);
          imageUrls.push(imageUrl);
        }
      }

      return sendMessage(
        recipientId, 
        text, 
        undefined, 
        imageUrls.length > 0 ? imageUrls : undefined
      );
    },
    onSuccess: () => {
      // Only invalidate conversations query to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message || "There was an error sending your message.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = async (
    activeConversationId: string | null,
    conversationsList: any[],
    text: string, 
    images?: File[]
  ) => {
    if (!activeConversationId) return;

    // Find the active conversation
    const activeConversation = conversationsList.find(
      (conversation) => conversation.id === activeConversationId
    );

    if (!activeConversation) return;

    try {
      // Get the current user session
      const { data } = await supabase.auth.getSession();
      const currentUserId = data.session?.user.id || "";
      
      if (!currentUserId) {
        console.error("No current user ID found");
        return;
      }
      
      // Find the recipient
      const recipient = activeConversation.participants.find(
        (participant) => participant.id !== currentUserId
      );
  
      if (!recipient) {
        console.error("No recipient found in conversation");
        return;
      }
  
      // Send the message
      sendMessageMutation.mutate({ 
        recipientId: recipient.id, 
        text, 
        images 
      });
    } catch (error) {
      console.error("Error in message sending process:", error);
    }
  };

  return {
    handleSendMessage,
    isSending: sendMessageMutation.isPending
  };
};
