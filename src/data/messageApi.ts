
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, Product, currentUser } from './messages';
import { getUserById } from './messages';

// Local storage key for conversations
const CONVERSATIONS_STORAGE_KEY = 'marketplaceConversations';

// Helper function to save conversations to local storage
const saveConversationsToStorage = (conversations: Conversation[]) => {
  localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
};

// Helper function to load conversations from local storage
const loadConversationsFromStorage = (): Conversation[] => {
  const storedConversations = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
  return storedConversations ? JSON.parse(storedConversations) : [];
};

// Fetch conversations for the current user
export const fetchConversations = async (): Promise<Conversation[]> => {
  // Load conversations from storage
  const conversations = loadConversationsFromStorage();
  
  // Update current user ID if needed
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user && user.id) {
    currentUser.id = user.id;
    currentUser.name = user.name;
  }
  
  // Filter conversations that include the current user
  return conversations.filter(conversation => 
    conversation.participants.some(p => p.id === currentUser.id)
  );
};

// Send a message to a recipient
export const sendMessage = async (
  recipientId: string, 
  text: string,
  product?: Product, 
  images?: string[]
): Promise<Message> => {
  // Load existing conversations
  const conversations = loadConversationsFromStorage();
  
  // Find or create a conversation with this recipient
  let conversation = conversations.find(conv => 
    conv.participants.some(p => p.id === currentUser.id) && 
    conv.participants.some(p => p.id === recipientId)
  );
  
  // If conversation doesn't exist, create one
  if (!conversation) {
    const recipient = getUserById(recipientId);
    if (!recipient) {
      throw new Error(`Recipient with ID ${recipientId} not found`);
    }
    
    // Create a new conversation
    conversation = {
      id: uuidv4(),
      participants: [currentUser, recipient],
      messages: [],
      unreadCount: 0
    };
    
    conversations.push(conversation);
  }
  
  // Create a new message
  const newMessage: Message = {
    id: uuidv4(),
    conversationId: conversation.id,
    senderId: currentUser.id,
    text,
    timestamp: Date.now(),
    images,
    product
  };
  
  // Add the message to the conversation
  conversation.messages.push(newMessage);
  
  // If the message is from current user, incremate unread count for recipient
  // In a real app, this would be handled differently
  if (currentUser.id !== recipientId) {
    conversation.unreadCount += 1;
  }
  
  // Save updated conversations
  saveConversationsToStorage(conversations);
  
  return newMessage;
};

// Mark messages in a conversation as read
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  const conversations = loadConversationsFromStorage();
  
  const conversation = conversations.find(c => c.id === conversationId);
  if (conversation) {
    conversation.unreadCount = 0;
    saveConversationsToStorage(conversations);
  }
};
