
import { supabase } from '@/integrations/supabase/client';

// Mark messages in a conversation as read
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if the conversation ID contains a hyphen which indicates it's a composite ID
    if (!conversationId.includes('-')) {
      console.error('Invalid conversation ID format:', conversationId);
      return;
    }
    
    // Parse the conversation ID to get the participants
    const participantIds = conversationId.split('-');
    
    // Handle UUIDs which may contain hyphens themselves
    let otherUserId: string;
    if (participantIds.length === 2) {
      // Simple case: just two IDs separated by a hyphen
      otherUserId = participantIds[0] === user.id ? participantIds[1] : participantIds[0];
    } else {
      // Complex case: UUIDs with hyphens
      // Reconstruct the UUIDs from the parts
      const firstId = participantIds.slice(0, 5).join('-'); // First UUID
      const secondId = participantIds.slice(5).join('-'); // Second UUID
      
      // Determine which one is the other user
      otherUserId = firstId === user.id ? secondId : firstId;
    }
    
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
