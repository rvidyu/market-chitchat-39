// Re-export everything from the new files
export * from './types';
export * from './users';
export * from './messagingProducts';
export * from './conversations';
export * from './messageUtils';

// Empty collections without mock data
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: number;
  images?: string[];
  product?: Product;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  unreadCount: number;
}

export const currentUser: User = {
  id: "",
  name: "",
  avatar: "",
  isOnline: false
};

// Helper function to get user by ID
export const getUserById = (userId: string): User | undefined => {
  return undefined;
};

// Helper function to format timestamp
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Check if the message was sent today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Check if the message was sent yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Check if the message was sent this week
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Otherwise, return the date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Empty conversations array
const conversations: Conversation[] = [];

export default conversations;
