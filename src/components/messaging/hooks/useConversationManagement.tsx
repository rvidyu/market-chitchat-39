
import { useState, useEffect } from "react";
import { Conversation, currentUser } from "@/data/messages";
import { useToast } from "@/hooks/use-toast";
import { loadConversations, saveConversations } from "@/data/conversations";

export const useConversationManagement = (
  initialConversationId: string | null = null
) => {
  const [conversationsList, setConversationsList] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);
  const { toast } = useToast();
  
  // Load conversations from localStorage on initial render
  useEffect(() => {
    const savedConversations = loadConversations();
    setConversationsList(savedConversations);
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversationsList.length > 0) {
      saveConversations(conversationsList);
    }
  }, [conversationsList]);

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

  return {
    conversationsList,
    setConversationsList,
    activeConversationId,
    setActiveConversationId,
    handleSendMessage,
    handleSelectConversation
  };
};
