
import { supabase } from '@/integrations/supabase/client';

// Mark messages in a conversation as read
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Parse the conversation ID to get the participant IDs
    const participantIds = conversationId.split('-');
    
    if (participantIds.length !== 2) {
      throw new Error('Invalid conversation ID format');
    }
    
    // Get the other participant's ID
    const otherParticipantId = participantIds[0] === user.id ? participantIds[1] : participantIds[0];
    
    // Update all messages from the other participant to the current user as read
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', otherParticipantId)
      .eq('recipient_id', user.id)
      .eq('is_read', false);
      
    if (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
    
  } catch (err) {
    console.error('Error in markMessagesAsRead:', err);
    throw err;
  }
};

// Count unread messages for a user
export const countUnreadMessages = async (): Promise<number> => {
  try {
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return 0;
    }
    
    // Count unread messages where the user is the recipient
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);
      
    if (error) {
      console.error('Error counting unread messages:', error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Error in countUnreadMessages:', err);
    return 0;
  }
};
