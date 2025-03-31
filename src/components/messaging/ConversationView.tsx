
import { useEffect, useState } from "react";
import { Conversation, User } from "@/data/types";
import ConversationHeader from "./ConversationHeader";
import ConversationMessages from "./ConversationMessages";
import ConversationFooter from "./ConversationFooter";
import { useAuth } from "@/contexts/auth";

interface ConversationViewProps {
  conversation: Conversation;
  onSendMessage: (text: string, images?: File[]) => void;
  onReportSpam?: (conversationId: string) => void;
  blockedUsers?: string[];
}

export default function ConversationView({ 
  conversation, 
  onSendMessage, 
  onReportSpam,
  blockedUsers = []
}: ConversationViewProps) {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  
  useEffect(() => {
    if (!user || !conversation || !blockedUsers) return;
    
    // Find the other participant (not the current user)
    const otherParticipant = conversation.participants.find(
      (p) => p.id !== user.id
    );
    
    if (otherParticipant && blockedUsers.includes(otherParticipant.id)) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [conversation, user, blockedUsers]);
  
  if (!conversation) return null;
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ConversationHeader 
        participants={conversation.participants}
        onReportSpam={onReportSpam}
        conversationId={conversation.id}
        isBlocked={isBlocked}
      />
      
      {/* Messages */}
      <ConversationMessages messages={conversation.messages} />
      
      {/* Footer with Message Input */}
      <ConversationFooter onSendMessage={onSendMessage} isBlocked={isBlocked} />
    </div>
  );
}
