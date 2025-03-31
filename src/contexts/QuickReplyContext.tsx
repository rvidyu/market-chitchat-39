
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { QuickReply } from "@/data/quickReplies";

interface QuickReplyContextType {
  quickReplies: QuickReply[];
  addQuickReply: (text: string, category?: string) => void;
  updateQuickReply: (id: string, text: string, category?: string) => void;
  deleteQuickReply: (id: string) => void;
}

const QuickReplyContext = createContext<QuickReplyContextType | undefined>(undefined);

export const useQuickReplies = () => {
  const context = useContext(QuickReplyContext);
  if (!context) {
    throw new Error("useQuickReplies must be used within a QuickReplyProvider");
  }
  return context;
};

interface QuickReplyProviderProps {
  children: ReactNode;
}

export const QuickReplyProvider: React.FC<QuickReplyProviderProps> = ({ children }) => {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);

  // Initialize quick replies from localStorage
  useEffect(() => {
    const storedReplies = localStorage.getItem("quickReplies");
    
    if (storedReplies) {
      try {
        setQuickReplies(JSON.parse(storedReplies));
      } catch (error) {
        console.error("Failed to parse stored quick replies:", error);
        localStorage.removeItem("quickReplies");
      }
    } else {
      // Add some default quick replies if none exist
      const now = new Date().toISOString();
      const defaultReplies: QuickReply[] = [
        {
          id: uuidv4(),
          text: "Thank you for your interest! This item is still available.",
          category: "General",
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          text: "I'll ship this item within 1-2 business days after payment.",
          category: "Shipping",
          createdAt: now,
          updatedAt: now
        },
        {
          id: uuidv4(),
          text: "I accept returns within 30 days. Please contact me before returning an item.",
          category: "Returns",
          createdAt: now,
          updatedAt: now
        }
      ];
      
      setQuickReplies(defaultReplies);
      localStorage.setItem("quickReplies", JSON.stringify(defaultReplies));
    }
  }, []);

  // Save quick replies to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("quickReplies", JSON.stringify(quickReplies));
  }, [quickReplies]);

  const addQuickReply = (text: string, category: string = "General") => {
    const now = new Date().toISOString();
    const newReply: QuickReply = {
      id: uuidv4(),
      text,
      category,
      createdAt: now,
      updatedAt: now
    };
    
    setQuickReplies([...quickReplies, newReply]);
  };

  const updateQuickReply = (id: string, text: string, category?: string) => {
    setQuickReplies(
      quickReplies.map((reply) =>
        reply.id === id ? { 
          ...reply, 
          text, 
          category: category || reply.category,
          updatedAt: new Date().toISOString()
        } : reply
      )
    );
  };

  const deleteQuickReply = (id: string) => {
    setQuickReplies(quickReplies.filter((reply) => reply.id !== id));
  };

  return (
    <QuickReplyContext.Provider
      value={{
        quickReplies,
        addQuickReply,
        updateQuickReply,
        deleteQuickReply
      }}
    >
      {children}
    </QuickReplyContext.Provider>
  );
};
