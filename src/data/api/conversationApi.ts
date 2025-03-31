
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '../types';

// Fetch conversations for the current user
export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Use a more efficient query with JOIN operations to reduce database roundtrips
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        sender:profiles!conversations_sender_id_fkey(id, name),
        recipient:profiles!conversations_recipient_id_fkey(id, name)
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
    
    // Transform the data into Conversation objects
    const conversationsMap = new Map();
    
    for (const conv of conversations || []) {
      // Determine the conversation partner's ID
      const partnerId = conv.sender_id === user.id ? conv.recipient_id : conv.sender_id;
      
      // Create a unique conversation ID from the two user IDs (sorted)
      const participantIds = [user.id, partnerId].sort();
      const conversationId = participantIds.join('-');
      
      if (!conversationsMap.has(conversationId)) {
        // Get partner profile from the joined data
        const partnerProfile = conv.sender_id === user.id ? conv.recipient : conv.sender;
        
        // Fetch the latest messages for this conversation in a single query
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`)
          .order('timestamp', { ascending: false })
          .limit(20);
          
        // Count unread messages
        const unreadCount = messages?.filter(
          msg => msg.sender_id === partnerId && !msg.is_read
        ).length || 0;
        
        // Create conversation object with all required fields
        const conversation: Conversation = {
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
              name: partnerProfile?.name || "Unknown User",
              avatar: "", 
              isOnline: false,
            }
          ],
          messages: (messages || []).map(msg => ({
            id: msg.id,
            conversationId: conversationId,
            senderId: msg.sender_id,
            text: msg.text,
            timestamp: msg.timestamp,
            isRead: msg.is_read,
            ...(msg.product_id && {
              product: {
                id: msg.product_id,
                name: msg.product_name || "Product",
                image: msg.product_image || "",
                price: msg.product_price || ""
              }
            }),
            ...(msg.images && { images: msg.images })
          })).reverse(),
          unreadCount,
          lastActivity: conv.timestamp
        };
        
        conversationsMap.set(conversationId, conversation);
      }
    }
    
    // Convert the map to an array and sort by last activity
    return Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
    
  } catch (err) {
    console.error('Error in fetchConversations:', err);
    return [];
  }
};
