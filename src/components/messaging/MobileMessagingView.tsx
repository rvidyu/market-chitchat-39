
import { Conversation } from "@/data/types"; // Updated import
import MobileHeader from "./MobileHeader";
import ConversationView from "./ConversationView";

interface MobileMessagingViewProps {
  activeConversation: Conversation | undefined;
  onSendMessage: (text: string, images?: File[]) => void;
  onReportSpam: (conversationId: string) => void;
  onBackToList: () => void;
  blockedUsers?: string[];
}

export default function MobileMessagingView({
  activeConversation,
  onSendMessage,
  onReportSpam,
  onBackToList,
  blockedUsers = []
}: MobileMessagingViewProps) {
  return (
    <div className="w-full flex flex-col">
      <MobileHeader onBackClick={onBackToList} />
      
      {activeConversation && (
        <ConversationView
          conversation={activeConversation}
          onSendMessage={onSendMessage}
          onReportSpam={onReportSpam}
          blockedUsers={blockedUsers}
        />
      )}
    </div>
  );
}
