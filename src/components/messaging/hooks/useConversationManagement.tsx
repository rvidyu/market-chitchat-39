
import { useState, useEffect } from "react";
import { Conversation } from "@/data/types";
import { useToast } from "@/hooks/use-toast";
import { fetchConversations, sendMessage, markMessagesAsRead } from "@/data/messageApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useConversationManagement = (
  initialConversationId: string | null = null
) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations from Supabase with optimized queries
  const { data: conversationsList = [], isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 1000 * 30, // Reduced to 30 seconds for more frequent refreshes
    refetchInterval: 5000, // Poll every 5 seconds for new messages as a backup
  });

  // Handle sending a new message with optimized mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, text, images }: { recipientId: string, text: string, images?: File[] }) => {
      // Handle image uploads more efficiently
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        // For future implementation: process images more efficiently
        for (const image of images) {
          const imageUrl = URL.createObjectURL(image);
          imageUrls.push(imageUrl);
        }
      }

      return sendMessage(recipientId, text, undefined, imageUrls.length > 0 ? imageUrls : undefined);
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

  // Handle marking messages as read more efficiently
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

  // Optimize message sending by getting currentUserId once
  const handleSendMessage = (text: string, images?: File[]) => {
    if (!activeConversationId) return;

    // Find the active conversation
    const activeConversation = conversationsList.find(
      (conversation) => conversation.id === activeConversationId
    );

    if (!activeConversation) return;

    // Use async/await instead of nested promises for better performance
    const sendMessageAsync = async () => {
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

    // Execute the async function
    sendMessageAsync();
  };

  // Mark messages as read when a conversation is selected
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    
    // Mark messages as read immediately when the conversation is selected
    if (conversationId) {
      console.log("Marking messages as read for conversation:", conversationId);
      markAsReadMutation.mutate(conversationId);
    }
  };

  // Update active conversation when initialConversationId changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
      
      // Mark messages as read when initial conversation is set
      console.log("Marking messages as read for initial conversation:", initialConversationId);
      markAsReadMutation.mutate(initialConversationId);
    }
  }, [initialConversationId]);

  // Fix for ensuring messages are marked as read when viewing a conversation
  useEffect(() => {
    if (activeConversationId) {
      // This ensures that any time we have an active conversation, we mark messages as read
      const conversation = conversationsList.find(c => c.id === activeConversationId);
      if (conversation && conversation.unreadCount > 0) {
        console.log("Effect: Marking messages as read for active conversation:", activeConversationId);
        markAsReadMutation.mutate(activeConversationId);
      }
    }
  }, [activeConversationId, conversationsList]);

  // Set up enhanced realtime subscription for new messages
  useEffect(() => {
    // Get the current authenticated user from Supabase
    const setupRealtimeListener = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      
      if (user) {
        // Enable realtime for the messages table if not already enabled
        await supabase
          .from('messages')
          .select('id')
          .limit(1);

        // Set up the channel for real-time messages with more specific filters
        const channel = supabase
          .channel('public:messages')
          .on(
            'postgres_changes',
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages',
              filter: `recipient_id=eq.${user.id}`
            },
            (payload) => {
              console.log("New message received:", payload);
              // When a new message comes in, refresh the conversations immediately
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              
              // If it's not from the active conversation, show a toast
              const newMessageSenderId = payload.new.sender_id;
              const newMessageRecipientId = payload.new.recipient_id;
              
              // Create conversation ID in the same format as our app uses
              const participantIds = [newMessageSenderId, newMessageRecipientId].sort();
              const messageConversationId = participantIds.join('-');
              
              if (messageConversationId !== activeConversationId) {
                toast({
                  title: "New message",
                  description: "You have received a new message.",
                });
              } else {
                // If it's from the active conversation, mark it as read immediately
                markAsReadMutation.mutate(messageConversationId);
              }
            }
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
          });
          
        // Return cleanup function
        return () => {
          console.log("Cleaning up realtime subscription");
          supabase.removeChannel(channel);
        };
      }
    };
    
    // Call the async function
    const cleanup = setupRealtimeListener();
    
    // Return cleanup function
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [queryClient, toast, activeConversationId]);

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
