
import { useState, useEffect } from "react";
import { Conversation, currentUser } from "@/data/messages";
import { useToast } from "@/hooks/use-toast";
import { fetchConversations, sendMessage, markMessagesAsRead } from "@/data/messageApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useConversationManagement = (
  initialConversationId: string | null = null
) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations from Supabase
  const { data: conversationsList = [], isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 1000 * 60, // 1 minute
  });

  // Handle sending a new message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, text, images }: { recipientId: string, text: string, images?: File[] }) => {
      // Handle image uploads (in a real app)
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        images.forEach(image => {
          const imageUrl = URL.createObjectURL(image);
          imageUrls.push(imageUrl);
        });
      }

      return sendMessage(recipientId, text, undefined, imageUrls.length > 0 ? imageUrls : undefined);
    },
    onSuccess: () => {
      // Invalidate conversations query to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Show success toast
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message || "There was an error sending your message.",
        variant: "destructive",
      });
    }
  });

  // Handle marking messages as read
  const markAsReadMutation = useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: () => {
      // Invalidate conversations query to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Handle sending a message
  const handleSendMessage = (text: string, images?: File[]) => {
    if (!activeConversationId) return;

    // Find the active conversation
    const activeConversation = conversationsList.find(
      (conversation) => conversation.id === activeConversationId
    );

    if (!activeConversation) return;

    // Find the recipient (not the current user)
    const recipient = activeConversation.participants.find(
      (participant) => participant.id !== currentUser.id
    );

    if (!recipient) return;

    // Send the message
    sendMessageMutation.mutate({ 
      recipientId: recipient.id, 
      text, 
      images 
    });
  };

  // Mark messages as read when a conversation is selected
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    
    // Mark messages as read
    markAsReadMutation.mutate(conversationId);
  };

  // Update active conversation when initialConversationId changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
      markAsReadMutation.mutate(initialConversationId);
    }
  }, [initialConversationId]);

  return {
    conversationsList,
    isLoading,
    error,
    activeConversationId,
    setActiveConversationId,
    handleSendMessage,
    handleSelectConversation
  };
};
