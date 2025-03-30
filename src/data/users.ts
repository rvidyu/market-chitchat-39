
import { User } from "./types";

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

// Helper function to find a user by ID
export function getUserById(id: string): User | undefined {
  if (id === currentUser.id) return currentUser;
  return users.find(user => user.id === id);
}
