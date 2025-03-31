
import { Conversation } from "@/data/types"; // Updated import
import MobileHeader from "./MobileHeader";
import ConversationView from "./ConversationView";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MobileMessagingViewProps {
  activeConversation: Conversation | undefined;
  onSendMessage: (text: string, images?: File[]) => void;
  onReportSpam: (conversationId: string) => void;
  onBackToList: () => void;
}

export default function MobileMessagingView({
  activeConversation,
  onSendMessage,
  onReportSpam,
  onBackToList
}: MobileMessagingViewProps) {
  const [recipientName, setRecipientName] = useState<string>("");
  
  // Fetch the recipient name whenever the active conversation changes
  useEffect(() => {
    const fetchRecipientData = async () => {
      if (!activeConversation) return;
      
      try {
        // Find the other participant (not the current user)
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData.session?.user.id;
        
        if (!currentUserId) return;
        
        const otherParticipant = activeConversation.participants.find(
          participant => participant.id !== currentUserId
        );
        
        if (otherParticipant) {
          setRecipientName(otherParticipant.name || "User");
        }
      } catch (error) {
        console.error("Error fetching recipient data:", error);
      }
    };
    
    fetchRecipientData();
  }, [activeConversation]);

  return (
    <div className="w-full flex flex-col">
      <MobileHeader 
        onBackClick={onBackToList} 
        title={recipientName || "Conversation"} 
      />
      
      {activeConversation && (
        <ConversationView
          conversation={activeConversation}
          onSendMessage={onSendMessage}
          onReportSpam={onReportSpam}
        />
      )}
    </div>
  );
}
