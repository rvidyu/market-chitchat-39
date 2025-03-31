
import { useEffect } from "react";
import { conversations } from "@/data/messages";
import { useIsMobile } from "@/hooks/use-mobile";
import ConversationView from "./ConversationView";
import EmptyState from "./EmptyState";
import ConversationsList from "./ConversationsList";
import MessagingContainer from "./MessagingContainer";
import SpamReportNotification from "./SpamReportNotification";
import { useSpamManagement } from "./hooks/useSpamManagement";
import { useConversationManagement } from "./hooks/useConversationManagement";
import MobileMessagingView from "./MobileMessagingView";

interface MessagingProps {
  initialConversationId?: string | null;
  onNotSpamMarked?: () => void;
}

export default function Messaging({ initialConversationId = null, onNotSpamMarked }: MessagingProps) {
  const { isMobile } = useIsMobile();
  
  // Use our custom hooks
  const {
    spamConversations,
    showSpamNotification,
    handleReportSpam,
    handleUndoSpam,
    handleMarkNotSpam
  } = useSpamManagement({ onNotSpamMarked });
  
  const {
    conversationsList,
    activeConversationId,
    setActiveConversationId,
    handleSendMessage,
    handleSelectConversation
  } = useConversationManagement(conversations, initialConversationId);

  // Update active conversation when initialConversationId changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
      
      // Find the conversation
      const conversation = conversationsList.find(
        (conv) => conv.id === initialConversationId
      );
      
      // If found, mark messages as read
      if (conversation) {
        handleSelectConversation(initialConversationId);
      }
    }
  }, [initialConversationId]);

  // Find the active conversation
  const activeConversation = conversationsList.find(
    (conversation) => conversation.id === activeConversationId && !spamConversations.includes(conversation.id)
  );
  
  // Handle going back to list view on mobile
  const handleBackToList = () => {
    setActiveConversationId(null);
  };

  // Show only conversations list on mobile if no active conversation
  if (isMobile && activeConversationId) {
    return (
      <MessagingContainer>
        <MobileMessagingView 
          activeConversation={activeConversation}
          onSendMessage={handleSendMessage}
          onReportSpam={handleReportSpam}
          onBackToList={handleBackToList}
        />
      </MessagingContainer>
    );
  }

  return (
    <MessagingContainer>
      {/* Conversations Sidebar */}
      <div className={`${isMobile && activeConversationId ? 'hidden' : 'w-full'} md:w-96 border-r bg-white flex flex-col`}>
        <ConversationsList 
          conversations={conversationsList}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          spamConversations={spamConversations}
          onMarkNotSpam={handleMarkNotSpam}
        />
      </div>

      {/* Conversation View */}
      <div className={`${isMobile && !activeConversationId ? 'hidden' : 'flex'} md:flex flex-1 flex-col`}>
        {activeConversation ? (
          <ConversationView
            conversation={activeConversation}
            onSendMessage={handleSendMessage}
            onReportSpam={handleReportSpam}
          />
        ) : (
          <EmptyState />
        )}
      </div>
      
      {/* Spam Report Notification with Undo */}
      {showSpamNotification && (
        <SpamReportNotification onUndo={handleUndoSpam} />
      )}
    </MessagingContainer>
  );
}
