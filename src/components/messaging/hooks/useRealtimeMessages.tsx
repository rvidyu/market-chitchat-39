
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeMessages = (
  activeConversationId: string | null,
  onNewMessage?: (messageConversationId: string) => void
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
              } else if (onNewMessage) {
                // If it's from the active conversation, mark it as read immediately
                onNewMessage(messageConversationId);
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
  }, [queryClient, toast, activeConversationId, onNewMessage]);
};
