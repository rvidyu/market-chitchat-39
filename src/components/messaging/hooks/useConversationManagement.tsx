
import { useState, useEffect, useCallback } from "react";
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
  
  // Cache conversation list to avoid data jumps during refetch
  const [cachedConversations, setCachedConversations] = useState<Conversation[]>([]);
  
  // Use optimized query settings
  const { data: fetchedConversations = [], isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 1000 * 60, // 1 minute stale time for better caching
    refetchInterval: 15000, // Poll every 15 seconds as backup
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Update cached conversations when new data arrives
  useEffect(() => {
    if (fetchedConversations.length > 0) {
      setCachedConversations(fetchedConversations);
    }
  }, [fetchedConversations]);

  // Use our custom hooks
  const { handleSendMessage, isSending } = useMessageSending();
  const { handleMarkMessagesAsRead } = useMessageReading();
  
  // Set up realtime message subscription
  useRealtimeMessages(activeConversationId, handleMarkMessagesAsRead);

  // Memoized version of the mark messages as read handler
  const markMessagesAsRead = useCallback((conversationId: string) => {
    if (conversationId) {
      handleMarkMessagesAsRead(conversationId);
    }
  }, [handleMarkMessagesAsRead]);

  // Handle sending a message in the active conversation
  const sendMessageToActiveConversation = useCallback((text: string, images?: File[]) => {
    handleSendMessage(activeConversationId, cachedConversations, text, images);
  }, [activeConversationId, cachedConversations, handleSendMessage]);

  // Mark messages as read when a conversation is selected
  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    
    // Mark messages as read immediately when the conversation is selected
    markMessagesAsRead(conversationId);
  }, [markMessagesAsRead]);

  // Update active conversation when initialConversationId changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
      
      // Mark messages as read when initial conversation is set
      markMessagesAsRead(initialConversationId);
    }
  }, [initialConversationId, markMessagesAsRead]);

  // Fix for ensuring messages are marked as read when viewing a conversation
  useEffect(() => {
    if (activeConversationId) {
      // This ensures that any time we have an active conversation, we mark messages as read
      const conversation = cachedConversations.find(c => c.id === activeConversationId);
      if (conversation && conversation.unreadCount > 0) {
        markMessagesAsRead(activeConversationId);
      }
    }
  }, [activeConversationId, cachedConversations, markMessagesAsRead]);

  return {
    // Use cached conversations to prevent UI jumps during updates
    conversationsList: cachedConversations.length > 0 ? cachedConversations : fetchedConversations,
    isLoading,
    error,
    activeConversationId,
    setActiveConversationId,
    handleSendMessage: sendMessageToActiveConversation,
    handleSelectConversation,
    isSending
  };
};
