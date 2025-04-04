
export interface User {
  id: string;
  name: string;
  avatar: string;
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
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  product?: Product;
  images?: string[];
  conversationId: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastActivity: string;
  unreadCount: number;
}
