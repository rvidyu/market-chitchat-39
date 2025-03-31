import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // Keep a reference to the latest conversations to avoid unnecessary re-renders
  const latestConversationsRef = useRef<Conversation[]>([]);
  
  // Use optimized query settings with improved stale time and invalidation policies
  const { data: fetchedConversations = [], isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 1000 * 30, // 30 seconds stale time for better caching
    refetchInterval: 15000, // Poll every 15 seconds as backup
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Update cached conversations only when meaningful changes occur
  useEffect(() => {
    if (fetchedConversations.length > 0) {
      // Only update cached conversations if there's a meaningful difference
      const hasChanges = JSON.stringify(latestConversationsRef.current) !== JSON.stringify(fetchedConversations);
      
      if (hasChanges) {
        setCachedConversations(fetchedConversations);
        latestConversationsRef.current = fetchedConversations;
      }
    }
  }, [fetchedConversations]);

  // Use our custom hooks
  const { handleSendMessage, isSending } = useMessageSending();
  const { handleMarkMessagesAsRead } = useMessageReading();
  
  // Set up realtime message subscription with enhanced callback for message delivery
  useRealtimeMessages(activeConversationId, handleMarkMessagesAsRead);

  // Memoized version of the mark messages as read handler
  const markMessagesAsRead = useCallback((conversationId: string) => {
    if (conversationId) {
      console.log("Marking messages as read from conversation management:", conversationId);
      handleMarkMessagesAsRead(conversationId);
    }
  }, [handleMarkMessagesAsRead]);

  // Handle sending a message in the active conversation with optimized data access
  const sendMessageToActiveConversation = useCallback((text: string, images?: File[]) => {
    handleSendMessage(activeConversationId, latestConversationsRef.current, text, images);
  }, [activeConversationId, handleSendMessage]);

  // Mark messages as read when a conversation is selected
  const handleSelectConversation = useCallback((conversationId: string) => {
    console.log("Selecting conversation:", conversationId);
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
