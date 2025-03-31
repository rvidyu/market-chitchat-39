
import { supabase } from "@/integrations/supabase/client";
import type { Message, Conversation, User, Product } from "./types";
import { currentUser, getUserById, users } from "./users";

// Function to fetch all conversations for the current user
export async function fetchConversations() {
  if (!supabase.auth.getSession()) {
    throw new Error("Not authenticated");
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  // Group messages by conversation
  const conversationsMap = new Map<string, Conversation>();
  
  for (const message of messages) {
    const otherUserId = message.sender_id === currentUser.id ? message.recipient_id : message.sender_id;
    const conversationId = [currentUser.id, otherUserId].sort().join('-');
    
    // Get the other user's info
    const otherUserProfile = await getUserProfile(otherUserId);
    
    if (!conversationsMap.has(conversationId)) {
      // Create a new conversation entry
      conversationsMap.set(conversationId, {
        id: conversationId,
        participants: [
          currentUser,
          {
            id: otherUserId,
            name: otherUserProfile?.name || "Unknown User",
            avatar: otherUserProfile?.avatar || "https://via.placeholder.com/150",
            isOnline: false
          }
        ],
        messages: [],
        lastActivity: message.timestamp,
        unreadCount: 0
      });
    }
    
    const conversation = conversationsMap.get(conversationId)!;
    
    // Add message to conversation
    conversation.messages.push({
      id: message.id,
      senderId: message.sender_id,
      text: message.text,
      timestamp: message.timestamp,
      isRead: message.is_read,
      ...(message.product_id && {
        product: {
          id: message.product_id,
          name: message.product_name || "",
          image: message.product_image || "",
          price: message.product_price || ""
        }
      }),
      ...(message.images && { images: message.images })
    });
    
    // Count unread messages
    if (!message.is_read && message.sender_id !== currentUser.id) {
      conversation.unreadCount++;
    }
  }
  
  // Sort messages in each conversation by timestamp
  for (const conversation of conversationsMap.values()) {
    conversation.messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Set lastActivity to the timestamp of the most recent message
    if (conversation.messages.length > 0) {
      conversation.lastActivity = conversation.messages[conversation.messages.length - 1].timestamp;
    }
  }
  
  return Array.from(conversationsMap.values());
}

// Function to send a message
export async function sendMessage(
  recipientId: string,
  text: string,
  product?: Product,
  images?: string[]
): Promise<Message> {
  if (!supabase.auth.getSession()) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: currentUser.id,
      recipient_id: recipientId,
      text,
      ...(product && {
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        product_price: product.price
      }),
      ...(images && { images })
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  return {
    id: data.id,
    senderId: data.sender_id,
    text: data.text,
    timestamp: data.timestamp,
    isRead: data.is_read,
    ...(data.product_id && {
      product: {
        id: data.product_id,
        name: data.product_name || "",
        image: data.product_image || "",
        price: data.product_price || ""
      }
    }),
    ...(data.images && { images: data.images })
  };
}

// Function to mark messages as read
export async function markMessagesAsRead(conversationId: string): Promise<void> {
  if (!supabase.auth.getSession()) {
    throw new Error("Not authenticated");
  }
  
  // Extract the other user's ID from the conversation ID
  const userIds = conversationId.split('-');
  const otherUserId = userIds[0] === currentUser.id ? userIds[1] : userIds[0];
  
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", otherUserId)
    .eq("recipient_id", currentUser.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
}

// Function to get user profile from Supabase
async function getUserProfile(userId: string): Promise<{ name: string; avatar: string } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return {
    name: data.name || data.email || "Unknown User",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || "U")}&background=random`
  };
}
