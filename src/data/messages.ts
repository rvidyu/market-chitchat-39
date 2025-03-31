// Re-export everything from the new files
export * from './types';
export * from './users';
export * from './messagingProducts';
export * from './conversations';
export * from './messageUtils';

// Simple data store for messages
// In a real application, this would be fetched from a database

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

// The current user is based on the authenticated user
// This will be replaced with the actual logged-in user
export const currentUser: User = {
  id: "current-user",
  name: "Current User",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  isOnline: true
};

// Sample users
const users: User[] = [
  currentUser,
  {
    id: "seller-1",
    name: "Demo Seller",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    isOnline: true
  },
  {
    id: "seller-2",
    name: "Creative Crafts",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    isOnline: false
  },
  {
    id: "seller-3",
    name: "Artisan Jewelry",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    isOnline: true
  }
];

// Helper function to get user by ID
export const getUserById = (userId: string): User | undefined => {
  return users.find(user => user.id === userId);
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

// Sample conversations (empty by default)
const conversations: Conversation[] = [];

export default conversations;
