
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface UseSpamManagementProps {
  onNotSpamMarked?: () => void;
}

export const useSpamManagement = ({ onNotSpamMarked }: UseSpamManagementProps = {}) => {
  const [spamConversations, setSpamConversations] = useState<string[]>([]);
  const [showSpamNotification, setShowSpamNotification] = useState(false);
  const [lastReportedSpam, setLastReportedSpam] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Function to get the other user's ID from a conversation ID
  const getOtherUserId = useCallback((conversationId: string) => {
    if (!user) return null;
    
    // Conversation IDs are formed by joining the two user IDs with a hyphen
    const userIds = conversationId.split('-');
    // Return the ID that isn't the current user's ID
    return userIds[0] === user.id ? userIds[1] : userIds[0];
  }, [user]);

  // Block a user
  const blockUser = useCallback(async (userId: string, otherUserId: string) => {
    try {
      // Add blocking record in both directions to prevent either user from messaging the other
      const { error: blockError } = await supabase
        .from('blocked_users')
        .upsert([
          { blocker_id: userId, blocked_id: otherUserId },
          { blocker_id: otherUserId, blocked_id: userId } // Also block the other way around
        ]);
      
      if (blockError) {
        console.error("Error blocking user:", blockError);
        return false;
      }
      
      setBlockedUsers(prev => [...prev, otherUserId]);
      return true;
    } catch (error) {
      console.error("Exception when blocking user:", error);
      return false;
    }
  }, []);

  // Handle reporting spam and blocking the user
  const handleReportSpam = async (conversationId: string) => {
    // Add the conversation to spam list
    setSpamConversations(prev => [...prev, conversationId]);
    
    // Show notification component
    setShowSpamNotification(true);
    setLastReportedSpam(conversationId);
    
    // Hide notification after 8 seconds
    setTimeout(() => {
      setShowSpamNotification(false);
    }, 8000);
    
    // Block the other user if we have a valid current user
    if (user) {
      const otherUserId = getOtherUserId(conversationId);
      if (otherUserId) {
        const blocked = await blockUser(user.id, otherUserId);
        if (blocked) {
          console.log(`User ${otherUserId} has been blocked due to spam report`);
        }
      }
    }
  };
  
  // Handle undoing spam report
  const handleUndoSpam = async () => {
    if (lastReportedSpam && user) {
      // Remove from spam conversations
      setSpamConversations(prev => prev.filter(id => id !== lastReportedSpam));
      setShowSpamNotification(false);
      
      // Unblock the user
      const otherUserId = getOtherUserId(lastReportedSpam);
      if (otherUserId) {
        try {
          // Remove the blocking in both directions
          const { error: unblockError } = await supabase
            .from('blocked_users')
            .delete()
            .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`);
          
          if (unblockError) {
            console.error("Error unblocking user:", unblockError);
          } else {
            setBlockedUsers(prev => prev.filter(id => id !== otherUserId));
          }
        } catch (error) {
          console.error("Exception when unblocking user:", error);
        }
      }
      
      toast({
        title: "Spam report undone",
        description: "The conversation has been restored to your inbox.",
        variant: "default",
        className: "border-green-200",
      });
    }
  };
  
  // Handle marking a conversation as not spam
  const handleMarkNotSpam = async (conversationId: string) => {
    // Remove from spam conversations
    setSpamConversations(prev => prev.filter(id => id !== conversationId));
    
    // Unblock the user if we have a valid current user
    if (user) {
      const otherUserId = getOtherUserId(conversationId);
      if (otherUserId) {
        try {
          // Remove the blocking in both directions
          const { error: unblockError } = await supabase
            .from('blocked_users')
            .delete()
            .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`);
          
          if (unblockError) {
            console.error("Error unblocking user:", unblockError);
          } else {
            setBlockedUsers(prev => prev.filter(id => id !== otherUserId));
          }
        } catch (error) {
          console.error("Exception when unblocking user:", error);
        }
      }
    }
    
    toast({
      title: "Marked as not spam",
      description: "The conversation has been moved back to your inbox.",
      variant: "default", 
      className: "border-green-200",
    });
    
    // Call the callback if provided
    if (onNotSpamMarked) {
      onNotSpamMarked();
    }
  };

  // Check if a user is blocked
  const isUserBlocked = useCallback((userId: string) => {
    return blockedUsers.includes(userId);
  }, [blockedUsers]);

  // Load blocked users for the current user
  const loadBlockedUsers = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);
        
      if (error) {
        console.error("Error loading blocked users:", error);
        return;
      }
      
      if (data && data.length > 0) {
        setBlockedUsers(data.map(item => item.blocked_id));
      }
    } catch (error) {
      console.error("Exception when loading blocked users:", error);
    }
  }, [user]);

  return {
    spamConversations,
    showSpamNotification,
    lastReportedSpam,
    blockedUsers,
    handleReportSpam,
    handleUndoSpam,
    handleMarkNotSpam,
    isUserBlocked,
    loadBlockedUsers
  };
};
