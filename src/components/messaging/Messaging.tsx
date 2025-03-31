
import { useState, useEffect } from "react";
import { conversations, Conversation, currentUser } from "@/data/messages";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ConversationView from "./ConversationView";
import EmptyState from "./EmptyState";
import ConversationsList from "./ConversationsList";
import MobileHeader from "./MobileHeader";
import MessagingContainer from "./MessagingContainer";
import SpamReportNotification from "./SpamReportNotification";

interface MessagingProps {
  initialConversationId?: string | null;
  onNotSpamMarked?: () => void;
}

export default function Messaging({ initialConversationId = null, onNotSpamMarked }: MessagingProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);
  const [conversationsList, setConversationsList] = useState(conversations);
  const [spamConversations, setSpamConversations] = useState<string[]>([]);
  const [showSpamNotification, setShowSpamNotification] = useState(false);
  const [lastReportedSpam, setLastReportedSpam] = useState<string | null>(null);
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
    (conversation) => conversation.id === activeConversationId && !spamConversations.includes(conversation.id)
  );
  
  // Get spam conversations
  const spamConversationsList = conversationsList.filter(
    (conversation) => spamConversations.includes(conversation.id)
  );

  // Handle sending a new message
  const handleSendMessage = (text: string, images?: File[]) => {
    if (!activeConversationId) return;

    // Create image URLs (in a real app, these would be uploaded to a server)
    const imageUrls: string[] = [];
    if (images && images.length > 0) {
      images.forEach(image => {
        const imageUrl = URL.createObjectURL(image);
        imageUrls.push(imageUrl);
      });
    }

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
          images: imageUrls.length > 0 ? imageUrls : undefined,
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
      description: images && images.length > 0 
        ? `Your message with ${images.length} ${images.length === 1 ? 'image' : 'images'} has been sent.`
        : "Your message has been sent successfully.",
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
  
  // Handle reporting spam
  const handleReportSpam = (conversationId: string) => {
    // Add the conversation to spam list
    setSpamConversations([...spamConversations, conversationId]);
    
    // If this was the active conversation, clear active conversation
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
    
    // Show notification
    setShowSpamNotification(true);
    setLastReportedSpam(conversationId);
    
    // Hide notification after 8 seconds
    setTimeout(() => {
      setShowSpamNotification(false);
    }, 8000);
  };
  
  // Handle undoing spam report
  const handleUndoSpam = () => {
    if (lastReportedSpam) {
      setSpamConversations(spamConversations.filter(id => id !== lastReportedSpam));
      setShowSpamNotification(false);
      
      toast({
        title: "Spam report undone",
        description: "The conversation has been restored to your inbox.",
      });
    }
  };
  
  // Handle marking a conversation as not spam
  const handleMarkNotSpam = (conversationId: string) => {
    setSpamConversations(spamConversations.filter(id => id !== conversationId));
    
    // Call the callback if provided
    if (onNotSpamMarked) {
      onNotSpamMarked();
    }
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
              onReportSpam={handleReportSpam}
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
