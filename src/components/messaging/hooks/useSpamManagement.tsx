
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseSpamManagementProps {
  onNotSpamMarked?: () => void;
}

export const useSpamManagement = ({ onNotSpamMarked }: UseSpamManagementProps = {}) => {
  const [spamConversations, setSpamConversations] = useState<string[]>([]);
  const [showSpamNotification, setShowSpamNotification] = useState(false);
  const [lastReportedSpam, setLastReportedSpam] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle reporting spam and blocking user
  const handleReportSpam = async (conversationId: string) => {
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user.id;
      
      if (!currentUserId) {
        toast({
          title: "Error",
          description: "You must be logged in to report spam",
          variant: "destructive",
        });
        return;
      }
      
      // Extract the other user ID from conversation ID (format is userID1-userID2)
      const userIds = conversationId.split('-');
      const otherUserId = userIds[0] === currentUserId ? userIds[1] : userIds[0];
      
      if (!otherUserId) {
        console.error("Could not determine other user ID from conversation:", conversationId);
        return;
      }
      
      // Add to blocked users table with proper type assertion
      const blockUserRpc = supabase.rpc.bind(supabase);
      const { error: blockError } = await (blockUserRpc as any)('block_user', { 
        blocker: currentUserId, 
        blocked: otherUserId 
      });
      
      if (blockError) {
        console.error("Error blocking user:", blockError);
        // Continue with spam reporting even if blocking fails
      } else {
        console.log(`User ${otherUserId} has been blocked`);
      }
    } catch (error) {
      console.error("Error in spam and block process:", error);
    }
    
    // Add the conversation to spam list (existing functionality)
    setSpamConversations([...spamConversations, conversationId]);
    
    // Show notification component (not toast)
    setShowSpamNotification(true);
    setLastReportedSpam(conversationId);
    
    // Hide notification after 8 seconds
    setTimeout(() => {
      setShowSpamNotification(false);
    }, 8000);
  };
  
  // Handle undoing spam report and unblocking
  const handleUndoSpam = async () => {
    if (lastReportedSpam) {
      try {
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData.session?.user.id;
        
        if (!currentUserId) return;
        
        // Extract the other user ID from conversation ID
        const userIds = lastReportedSpam.split('-');
        const otherUserId = userIds[0] === currentUserId ? userIds[1] : userIds[0];
        
        if (!otherUserId) return;
        
        // Remove from blocked users table with proper type assertion
        const unblockUserRpc = supabase.rpc.bind(supabase);
        const { error: unblockError } = await (unblockUserRpc as any)('unblock_user', { 
          blocker: currentUserId, 
          blocked: otherUserId 
        });
        
        if (unblockError) {
          console.error("Error unblocking user:", unblockError);
        } else {
          console.log(`User ${otherUserId} has been unblocked`);
        }
      } catch (error) {
        console.error("Error in undo block process:", error);
      }
      
      // Remove from spam conversations (existing functionality)
      setSpamConversations(spamConversations.filter(id => id !== lastReportedSpam));
      setShowSpamNotification(false);
      
      toast({
        title: "Spam report undone",
        description: "The conversation has been restored to your inbox and the user has been unblocked.",
        variant: "default",
        className: "border-green-200",
      });
    }
  };
  
  // Handle marking a conversation as not spam and unblocking
  const handleMarkNotSpam = async (conversationId: string) => {
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user.id;
      
      if (!currentUserId) return;
      
      // Extract the other user ID from conversation ID
      const userIds = conversationId.split('-');
      const otherUserId = userIds[0] === currentUserId ? userIds[1] : userIds[0];
      
      if (!otherUserId) return;
      
      // Remove from blocked users table with proper type assertion
      const unblockUserRpc = supabase.rpc.bind(supabase);
      const { error: unblockError } = await (unblockUserRpc as any)('unblock_user', { 
        blocker: currentUserId, 
        blocked: otherUserId 
      });
      
      if (unblockError) {
        console.error("Error unblocking user:", unblockError);
      } else {
        console.log(`User ${otherUserId} has been unblocked`);
      }
    } catch (error) {
      console.error("Error in mark not spam process:", error);
    }
    
    // Remove from spam conversations (existing functionality)
    setSpamConversations(spamConversations.filter(id => id !== conversationId));
    
    toast({
      title: "Marked as not spam",
      description: "The conversation has been moved back to your inbox and the user has been unblocked.",
      variant: "default", 
      className: "border-green-200",
    });
    
    // Call the callback if provided
    if (onNotSpamMarked) {
      onNotSpamMarked();
    }
  };

  return {
    spamConversations,
    showSpamNotification,
    lastReportedSpam,
    handleReportSpam,
    handleUndoSpam,
    handleMarkNotSpam
  };
};
