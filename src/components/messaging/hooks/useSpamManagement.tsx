
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseSpamManagementProps {
  onNotSpamMarked?: () => void;
}

export const useSpamManagement = ({ onNotSpamMarked }: UseSpamManagementProps = {}) => {
  const [spamConversations, setSpamConversations] = useState<string[]>([]);
  const [showSpamNotification, setShowSpamNotification] = useState(false);
  const [lastReportedSpam, setLastReportedSpam] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle reporting spam
  const handleReportSpam = (conversationId: string) => {
    // Add the conversation to spam list
    setSpamConversations([...spamConversations, conversationId]);
    
    // Show notification component (not toast)
    setShowSpamNotification(true);
    setLastReportedSpam(conversationId);
    
    // Hide notification after 8 seconds
    setTimeout(() => {
      setShowSpamNotification(false);
    }, 8000);
    
    // Removed toast notification
  };
  
  // Handle undoing spam report
  const handleUndoSpam = () => {
    if (lastReportedSpam) {
      setSpamConversations(spamConversations.filter(id => id !== lastReportedSpam));
      setShowSpamNotification(false);
      
      toast({
        title: "Spam report undone",
        description: "The conversation has been restored to your inbox.",
        variant: "default",
        className: "border-green-200",
      });
    }
  };
  
  // Handle marking a conversation as not spam
  const handleMarkNotSpam = (conversationId: string) => {
    setSpamConversations(spamConversations.filter(id => id !== conversationId));
    
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

  return {
    spamConversations,
    showSpamNotification,
    lastReportedSpam,
    handleReportSpam,
    handleUndoSpam,
    handleMarkNotSpam
  };
};
