
import { User } from "./types";

// Empty user data - no mock users
export const currentUser: User = {
  id: "",
  name: "",
  avatar: "",
  isOnline: false
};

export const users: User[] = [];

// Helper function to find a user by ID
export function getUserById(id: string): User | undefined {
  if (id === currentUser.id) return currentUser;
  return users.find(user => user.id === id);
}
