
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '../types';

// Fetch conversations for the current user
export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get the unique conversation partners for this user by combining
    // both sent and received messages
    const { data: senderRecipientPairs, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
    
    // Transform the data into Conversation objects
    const conversationsMap = new Map();
    
    for (const pair of senderRecipientPairs || []) {
      // Determine the conversation partner's ID
      const partnerId = pair.sender_id === user.id ? pair.recipient_id : pair.sender_id;
      
      // Create a unique conversation ID from the two user IDs (sorted)
      const participantIds = [user.id, partnerId].sort();
      const conversationId = participantIds.join('-');
      
      if (!conversationsMap.has(conversationId)) {
        // Fetch the other user's profile
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', partnerId)
          .maybeSingle();
          
        // Fetch the latest messages for this conversation
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
        
        // Get current user's profile for the name
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .maybeSingle();
        
        // Create conversation object - Making sure all properties match the type
        const conversation: Conversation = {
          id: conversationId,
          participants: [
            {
              id: user.id,
              name: currentUserProfile?.name || user.user_metadata?.name || user.email || "You",
              avatar: "", // Adding required avatar field
              isOnline: true,
            },
            {
              id: partnerId,
              name: partnerProfile?.name || "Unknown User",
              avatar: "", // Adding required avatar field
              isOnline: false,
            }
          ],
          messages: (messages || []).map(msg => ({
            id: msg.id,
            conversationId: conversationId, // Ensure conversationId is set and required
            senderId: msg.sender_id,
            text: msg.text,
            timestamp: msg.timestamp, // Keep as string to match the type
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
          lastActivity: pair.timestamp // Ensure lastActivity is set
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
