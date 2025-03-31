
import { Conversation } from "./types";

// Helper function to load conversations from localStorage
export const loadConversations = (): Conversation[] => {
  try {
    const savedConversations = localStorage.getItem('conversations');
    return savedConversations ? JSON.parse(savedConversations) : [];
  } catch (error) {
    console.error("Error loading conversations from localStorage:", error);
    return [];
  }
};

// Helper function to save conversations to localStorage
export const saveConversations = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  } catch (error) {
    console.error("Error saving conversations to localStorage:", error);
  }
};

// Initialize with empty array or saved data
export const conversations: Conversation[] = loadConversations();

// Helper function to find a conversation by ID
export function getConversationById(id: string): Conversation | undefined {
  return loadConversations().find(conversation => conversation.id === id);
}
