
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
    let userId: string | null = null;
    
    // Get the current authenticated user from sessionStorage first if available
    const setupRealtimeListener = async () => {
      try {
        const sessionUser = sessionStorage.getItem('currentUser');
        let user = sessionUser ? JSON.parse(sessionUser) : null;
        
        if (!user) {
          // If not in session storage, get from supabase and store for future use
          const { data } = await supabase.auth.getUser();
          user = data.user;
          if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
          }
        }
        
        if (!user) return null;
        
        userId = user.id;
        
        // Set up the channel for real-time messages with optimized configuration
        const channel = supabase
          .channel('messages-realtime', {
            config: {
              broadcast: { self: true },
              presence: { key: userId },
            }
          })
          .on(
            'postgres_changes',
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages',
              filter: `recipient_id=eq.${userId}`
            },
            (payload) => {
              console.log("New message received:", payload);
              
              // Faster invalidation approach with targeted cache updates
              queryClient.invalidateQueries({ 
                queryKey: ['conversations'],
                refetchType: 'active',
                exact: false
              });
              
              // Extract conversation participants
              const newMessageSenderId = payload.new.sender_id;
              const newMessageRecipientId = payload.new.recipient_id;
              
              // Create conversation ID in the same format as our app uses
              const participantIds = [newMessageSenderId, newMessageRecipientId].sort();
              const messageConversationId = participantIds.join('-');
              
              if (messageConversationId !== activeConversationId) {
                // Show notification for messages not in the active conversation
                toast({
                  title: "New message",
                  description: "You have received a new message.",
                  duration: 3000, // Shorter duration for better UX
                });
              } else if (onNewMessage) {
                // If it's from the active conversation, mark it as read immediately
                onNewMessage(messageConversationId);
              }
            }
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
            if (status === "SUBSCRIBED") {
              console.log("✅ Realtime subscription active");
            }
          });
          
        // Return cleanup function
        return () => {
          console.log("Cleaning up realtime subscription");
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
        return null;
      }
    };
    
    // Call the async function
    const cleanupPromise = setupRealtimeListener();
    
    // Return cleanup function
    return () => {
      cleanupPromise.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [queryClient, toast, activeConversationId, onNewMessage]);
};
