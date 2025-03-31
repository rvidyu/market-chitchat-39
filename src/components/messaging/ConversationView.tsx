
import { Conversation } from "@/data/types";
import ConversationHeader from "./ConversationHeader";
import ConversationMessages from "./ConversationMessages";
import ConversationFooter from "./ConversationFooter";

interface ConversationViewProps {
  conversation: Conversation;
  onSendMessage: (text: string, images?: File[]) => void;
  onReportSpam?: (conversationId: string) => void;
}

export default function ConversationView({ 
  conversation, 
  onSendMessage, 
  onReportSpam 
}: ConversationViewProps) {
  if (!conversation) return null;
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ConversationHeader 
        participants={conversation.participants}
        onReportSpam={onReportSpam}
        conversationId={conversation.id}
      />
      
      {/* Messages */}
      <ConversationMessages messages={conversation.messages} />
      
      {/* Footer with Message Input */}
      <ConversationFooter onSendMessage={onSendMessage} />
    </div>
  );
}
