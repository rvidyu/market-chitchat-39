
import { Conversation } from "@/data/messages";
import MobileHeader from "./MobileHeader";
import ConversationView from "./ConversationView";

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
  return (
    <div className="w-full flex flex-col">
      <MobileHeader onBackClick={onBackToList} />
      
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
