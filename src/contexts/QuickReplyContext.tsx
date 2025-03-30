
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { QuickReply, initialQuickReplies } from "@/data/quickReplies";
import { useToast } from "@/hooks/use-toast";

interface QuickReplyContextType {
  quickReplies: QuickReply[];
  addQuickReply: (text: string, category?: string) => void;
  updateQuickReply: (id: string, text: string, category?: string) => void;
  deleteQuickReply: (id: string) => void;
}

const QuickReplyContext = createContext<QuickReplyContextType | undefined>(undefined);

export const QuickReplyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const { toast } = useToast();

  // Load quick replies from localStorage on mount
  useEffect(() => {
    const savedReplies = localStorage.getItem("quickReplies");
    if (savedReplies) {
      try {
        setQuickReplies(JSON.parse(savedReplies));
      } catch (error) {
        console.error("Failed to parse saved quick replies:", error);
        setQuickReplies(initialQuickReplies);
      }
    } else {
      setQuickReplies(initialQuickReplies);
    }
  }, []);

  // Save quick replies to localStorage whenever they change
  useEffect(() => {
    if (quickReplies.length > 0) {
      localStorage.setItem("quickReplies", JSON.stringify(quickReplies));
    }
  }, [quickReplies]);

  const addQuickReply = (text: string, category: string = "General") => {
    const newReply: QuickReply = {
      id: `reply-${Date.now()}`,
      text,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setQuickReplies((prev) => [...prev, newReply]);
    toast({
      title: "Quick Reply Added",
      description: "Your new quick reply has been saved.",
    });
  };

  const updateQuickReply = (id: string, text: string, category?: string) => {
    setQuickReplies((prev) => 
      prev.map((reply) => {
        if (reply.id === id) {
          return {
            ...reply,
            text,
            category: category || reply.category,
            updatedAt: new Date().toISOString(),
          };
        }
        return reply;
      })
    );
    toast({
      title: "Quick Reply Updated",
      description: "Your quick reply has been updated.",
    });
  };

  const deleteQuickReply = (id: string) => {
    setQuickReplies((prev) => prev.filter((reply) => reply.id !== id));
    toast({
      title: "Quick Reply Deleted",
      description: "Your quick reply has been removed.",
    });
  };

  return (
    <QuickReplyContext.Provider
      value={{ quickReplies, addQuickReply, updateQuickReply, deleteQuickReply }}
    >
      {children}
    </QuickReplyContext.Provider>
  );
};

export const useQuickReplies = () => {
  const context = useContext(QuickReplyContext);
  if (context === undefined) {
    throw new Error("useQuickReplies must be used within a QuickReplyProvider");
  }
  return context;
};
