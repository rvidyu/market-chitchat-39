
import { useState, useEffect } from "react";
import { Conversation } from "@/data/types";
import { fetchConversations } from "@/data/api";
import { useQuery } from "@tanstack/react-query";
import { useMessageSending } from "./useMessageSending";
import { useMessageReading } from "./useMessageReading";
import { useRealtimeMessages } from "./useRealtimeMessages";

export const useConversationManagement = (
  initialConversationId: string | null = null
) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);
  
  // Fetch conversations from Supabase with optimized queries
  const { data: conversationsList = [], isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 1000 * 30, // Reduced to 30 seconds for more frequent refreshes
    refetchInterval: 5000, // Poll every 5 seconds for new messages as a backup
  });

  // Use our custom hooks
  const { handleSendMessage, isSending } = useMessageSending();
  const { handleMarkMessagesAsRead } = useMessageReading();
  
  // Set up realtime message subscription
  useRealtimeMessages(activeConversationId, handleMarkMessagesAsRead);

  // Handle sending a message in the active conversation
  const sendMessageToActiveConversation = (text: string, images?: File[]) => {
    handleSendMessage(activeConversationId, conversationsList, text, images);
  };

  // Mark messages as read when a conversation is selected
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    
    // Mark messages as read immediately when the conversation is selected
    if (conversationId) {
      handleMarkMessagesAsRead(conversationId);
    }
  };

  // Update active conversation when initialConversationId changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
      
      // Mark messages as read when initial conversation is set
      handleMarkMessagesAsRead(initialConversationId);
    }
  }, [initialConversationId]);

  // Fix for ensuring messages are marked as read when viewing a conversation
  useEffect(() => {
    if (activeConversationId) {
      // This ensures that any time we have an active conversation, we mark messages as read
      const conversation = conversationsList.find(c => c.id === activeConversationId);
      if (conversation && conversation.unreadCount > 0) {
        console.log("Effect: Marking messages as read for active conversation:", activeConversationId);
        handleMarkMessagesAsRead(activeConversationId);
      }
    }
  }, [activeConversationId, conversationsList]);

  return {
    conversationsList,
    isLoading,
    error,
    activeConversationId,
    setActiveConversationId,
    handleSendMessage: sendMessageToActiveConversation,
    handleSelectConversation,
    isSending
  };
};
