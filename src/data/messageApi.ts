import { supabase } from '@/integrations/supabase/client';
import { Message, Conversation, Product, User } from './types';

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
          .single();
          
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
          .single();
        
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

// Send a message to a recipient
export const sendMessage = async (
  recipientId: string, 
  text: string,
  product?: Product, 
  images?: string[]
): Promise<Message> => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Prepare the message data
    const messageData = {
      sender_id: user.id,
      recipient_id: recipientId,
      text,
      timestamp: new Date().toISOString(),
      is_read: false,
      ...(images && { images }),
      ...(product && {
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        product_price: product.price
      })
    };
    
    // Insert the message into the database
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    if (!newMessage) {
      throw new Error('Failed to create message');
    }
    
    // Create a unique conversation ID from the two user IDs (sorted)
    const participantIds = [user.id, recipientId].sort();
    const conversationId = participantIds.join('-');
    
    // Return the created message
    return {
      id: newMessage.id,
      conversationId: conversationId, // Make sure conversationId is included and required
      senderId: newMessage.sender_id,
      text: newMessage.text,
      timestamp: newMessage.timestamp, // Keep as string to match the type
      isRead: newMessage.is_read,
      images: newMessage.images,
      product: product
    };
  } catch (err: any) {
    console.error('Error sending message:', err);
    throw new Error(err.message || 'Failed to send message');
  }
};

// Mark messages in a conversation as read
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Parse the conversation ID to get the participants
    // Conversation IDs are in the format "user1Id-user2Id" (sorted)
    const participantIds = conversationId.split('-');
    if (participantIds.length !== 2) {
      console.error('Invalid conversation ID format:', conversationId);
      return;
    }
    
    // Determine the other participant's ID
    const otherUserId = participantIds[0] === user.id ? participantIds[1] : participantIds[0];
    
    // Create a more efficient query with better error handling
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', otherUserId)
      .eq('recipient_id', user.id)
      .eq('is_read', false);
      
    if (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
    
    console.log('Successfully marked messages as read for conversation:', conversationId);
  } catch (err) {
    console.error('Error marking messages as read:', err);
    throw err;
  }
};
