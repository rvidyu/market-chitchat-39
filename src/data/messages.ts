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
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastActivity: string;
  unreadCount: number;
}

// Mock users
export const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  isOnline: true
};

export const users: User[] = [
  {
    id: "user-2",
    name: "Emily Wilson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    isOnline: true
  },
  {
    id: "user-3",
    name: "Michael Brown",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    isOnline: false
  },
  {
    id: "user-4",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    isOnline: true
  },
  {
    id: "user-5",
    name: "David Clark",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    isOnline: false
  }
];

// Mock products
export const products: Product[] = [
  {
    id: "prod-1",
    name: "Vintage Leather Journal",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    price: "$45.00"
  },
  {
    id: "prod-2",
    name: "Handmade Ceramic Mug",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    price: "$28.50"
  },
  {
    id: "prod-3",
    name: "Macramé Wall Hanging",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    price: "$65.00"
  }
];

// Mock conversations
export const conversations: Conversation[] = [
  {
    id: "conv-1",
    participants: [currentUser, users[0]],
    messages: [
      {
        id: "msg-1",
        senderId: "user-2",
        text: "Hi there! I'm interested in the vintage leather journal you have listed.",
        timestamp: "2023-06-15T14:30:00",
        isRead: true,
        product: products[0]
      },
      {
        id: "msg-2",
        senderId: "user-1",
        text: "Hello! Yes, it's still available. It's handmade with genuine leather and has 200 pages.",
        timestamp: "2023-06-15T14:35:00",
        isRead: true
      },
      {
        id: "msg-3",
        senderId: "user-2",
        text: "That sounds perfect! Is the price negotiable?",
        timestamp: "2023-06-15T14:40:00",
        isRead: false
      }
    ],
    lastActivity: "2023-06-15T14:40:00",
    unreadCount: 1
  },
  {
    id: "conv-2",
    participants: [currentUser, users[1]],
    messages: [
      {
        id: "msg-4",
        senderId: "user-1",
        text: "Hi, I noticed you're selling handmade ceramic mugs. Do you offer custom colors?",
        timestamp: "2023-06-14T09:15:00",
        isRead: true,
        product: products[1]
      },
      {
        id: "msg-5",
        senderId: "user-3",
        text: "Hello! Yes, I can make them in various colors. Did you have something specific in mind?",
        timestamp: "2023-06-14T10:20:00",
        isRead: true
      },
      {
        id: "msg-6",
        senderId: "user-1",
        text: "I was thinking of a set in navy blue. Would that be possible?",
        timestamp: "2023-06-14T10:25:00",
        isRead: true
      },
      {
        id: "msg-7",
        senderId: "user-3",
        text: "Absolutely! Navy blue would look beautiful. I can create a set of 4 for $100. Would that work for you?",
        timestamp: "2023-06-14T10:30:00",
        isRead: false
      }
    ],
    lastActivity: "2023-06-14T10:30:00",
    unreadCount: 1
  },
  {
    id: "conv-3",
    participants: [currentUser, users[2]],
    messages: [
      {
        id: "msg-8",
        senderId: "user-4",
        text: "Hello! Is the macramé wall hanging still available?",
        timestamp: "2023-06-12T16:45:00",
        isRead: true,
        product: products[2]
      },
      {
        id: "msg-9",
        senderId: "user-1",
        text: "Hi Sarah! Yes, it's still available. It's approximately 24 inches wide and 36 inches long.",
        timestamp: "2023-06-12T17:00:00",
        isRead: true
      },
      {
        id: "msg-10",
        senderId: "user-4",
        text: "Great! And is it made from cotton or jute?",
        timestamp: "2023-06-12T17:05:00",
        isRead: true
      },
      {
        id: "msg-11",
        senderId: "user-1",
        text: "It's made from 100% natural cotton rope, which gives it a softer look and feel.",
        timestamp: "2023-06-12T17:10:00",
        isRead: true
      }
    ],
    lastActivity: "2023-06-12T17:10:00",
    unreadCount: 0
  },
  {
    id: "conv-4",
    participants: [currentUser, users[3]],
    messages: [
      {
        id: "msg-12",
        senderId: "user-5",
        text: "Hi there! Do you ship internationally?",
        timestamp: "2023-06-10T11:20:00",
        isRead: true
      },
      {
        id: "msg-13",
        senderId: "user-1",
        text: "Hello David! Yes, I do ship internationally, but additional shipping fees may apply depending on the location.",
        timestamp: "2023-06-10T11:30:00",
        isRead: true
      },
      {
        id: "msg-14",
        senderId: "user-5",
        text: "Perfect! I'm in Canada. Could you give me an estimate for shipping a vintage journal there?",
        timestamp: "2023-06-10T11:35:00",
        isRead: true,
        product: products[0]
      },
      {
        id: "msg-15",
        senderId: "user-1",
        text: "For Canada, shipping would be approximately $15 for standard shipping or $25 for express.",
        timestamp: "2023-06-10T11:45:00",
        isRead: true
      }
    ],
    lastActivity: "2023-06-10T11:45:00",
    unreadCount: 0
  }
];

// Helper function to find a conversation by ID
export function getConversationById(id: string): Conversation | undefined {
  return conversations.find(conversation => conversation.id === id);
}

// Helper function to find a user by ID
export function getUserById(id: string): User | undefined {
  if (id === currentUser.id) return currentUser;
  return users.find(user => user.id === id);
}

// Helper function to format timestamp to a more readable format
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // If less than 24 hours, return time
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If less than a week, return day of week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Otherwise return date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
