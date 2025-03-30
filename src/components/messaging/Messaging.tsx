
import { useState, useEffect } from "react";
import { conversations, Conversation, currentUser } from "@/data/messages";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ConversationView from "./ConversationView";
import EmptyState from "./EmptyState";
import ConversationsList from "./ConversationsList";
import MobileHeader from "./MobileHeader";
import MessagingContainer from "./MessagingContainer";

interface MessagingProps {
  initialConversationId?: string | null;
}

export default function Messaging({ initialConversationId = null }: MessagingProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);
  const [conversationsList, setConversationsList] = useState(conversations);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

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
    (conversation) => conversation.id === activeConversationId
  );

  // Handle sending a new message
  const handleSendMessage = (text: string) => {
    if (!activeConversationId) return;

    // Create a new conversations list with the new message
    const updatedConversations = conversationsList.map((conversation) => {
      if (conversation.id === activeConversationId) {
        // Create a new message
        const newMessage = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          text,
          timestamp: new Date().toISOString(),
          isRead: true,
        };

        // Return the updated conversation
        return {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          lastActivity: new Date().toISOString(),
        };
      }
      return conversation;
    });

    // Update the state
    setConversationsList(updatedConversations);

    // Show success toast
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
  };

  // Mark messages as read when a conversation is selected
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);

    // Mark all messages in the conversation as read
    const updatedConversations = conversationsList.map((conversation) => {
      if (conversation.id === conversationId) {
        return {
          ...conversation,
          messages: conversation.messages.map((message) => ({
            ...message,
            isRead: true,
          })),
          unreadCount: 0,
        };
      }
      return conversation;
    });

    setConversationsList(updatedConversations);
  };
  
  const handleBackToList = () => {
    setActiveConversationId(null);
  };

  // Show only conversations list on mobile if no active conversation
  if (isMobile && activeConversationId) {
    return (
      <MessagingContainer>
        <div className="w-full flex flex-col">
          <MobileHeader onBackClick={handleBackToList} />
          
          {activeConversation && (
            <ConversationView
              conversation={activeConversation}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </MessagingContainer>
    );
  }

  return (
    <MessagingContainer>
      {/* Conversations Sidebar */}
      <div className={`${isMobile && activeConversationId ? 'hidden' : 'w-full'} md:w-80 border-r bg-white flex flex-col`}>
        <ConversationsList 
          conversations={conversationsList}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Conversation View */}
      <div className={`${isMobile && !activeConversationId ? 'hidden' : 'flex'} md:flex flex-1 flex-col`}>
        {activeConversation ? (
          <ConversationView
            conversation={activeConversation}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </MessagingContainer>
  );
}
