
import { supabase } from '@/integrations/supabase/client';
import { Message, Product } from '../types';

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
    
    console.log(`Sending message from ${user.id} to ${recipientId}`);
    console.log(`Message text: ${text}`);
    
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
    
    console.log('Inserting message with data:', messageData);
    
    // Insert the message into the database
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
      
    if (error) {
      console.error('Error inserting message:', error);
      throw error;
    }
    
    if (!newMessage) {
      console.error('No message data returned after insert');
      throw new Error('Failed to create message');
    }
    
    console.log('Message successfully created:', newMessage);
    
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
