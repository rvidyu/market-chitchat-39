
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '../types';

// Fetch conversations for the current user
export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    console.log("Fetching conversations for user:", user.id);
    
    // First, get all messages involving the current user
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('timestamp', { ascending: false });
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return [];
    }
    
    // Map to store conversations
    const conversationsMap = new Map<string, Conversation>();
    
    // Process messages to build conversations
    for (const message of messages || []) {
      // Determine the conversation partner's ID
      const partnerId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
      
      // Create a unique conversation ID using sorted participant IDs
      const participantIds = [user.id, partnerId].sort();
      const conversationId = participantIds.join('-');
      
      // If this conversation isn't in our map yet, fetch the partner's profile and initialize it
      if (!conversationsMap.has(conversationId)) {
        // Fetch partner profile information
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', partnerId)
          .maybeSingle();
        
        // Create a new conversation object
        conversationsMap.set(conversationId, {
          id: conversationId,
          participants: [
            {
              id: user.id,
              name: user.user_metadata?.name || user.email || "You",
              avatar: "",
              isOnline: true,
            },
            {
              id: partnerId,
              name: partnerProfile?.name || `User ${partnerId.substring(0, 8)}`,
              avatar: "",
              isOnline: false,
            }
          ],
          messages: [],
          lastActivity: message.timestamp,
          unreadCount: 0
        });
      }
      
      // Get the conversation we're building
      const conversation = conversationsMap.get(conversationId)!;
      
      // Add this message to the conversation
      conversation.messages.push({
        id: message.id,
        conversationId: conversationId,
        senderId: message.sender_id,
        text: message.text,
        timestamp: message.timestamp,
        isRead: message.is_read,
        ...(message.product_id && {
          product: {
            id: message.product_id,
            name: message.product_name || "Product",
            image: message.product_image || "",
            price: message.product_price || ""
          }
        }),
        ...(message.images && { images: message.images })
      });
      
      // Update last activity
      if (new Date(message.timestamp) > new Date(conversation.lastActivity)) {
        conversation.lastActivity = message.timestamp;
      }
      
      // Update unread count if the message is unread and not from the current user
      if (!message.is_read && message.sender_id !== user.id) {
        conversation.unreadCount++;
      }
    }
    
    // Sort messages chronologically for each conversation
    for (const conversation of conversationsMap.values()) {
      conversation.messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }
    
    // Convert map to array and sort by last activity
    return Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
    
  } catch (err) {
    console.error('Error in fetchConversations:', err);
    return [];
  }
};
