
// Mock data for quick replies
export interface QuickReply {
  id: string;
  text: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Initial quick replies for demo purposes
export const initialQuickReplies: QuickReply[] = [
  {
    id: "reply-1",
    text: "Hi! Is this item still available?",
    category: "General",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "reply-2",
    text: "I'm interested in this item. Would you consider $X?",
    category: "Negotiation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "reply-3",
    text: "Do you offer international shipping?",
    category: "Shipping",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "reply-4",
    text: "Thanks for your message! I'll get back to you as soon as possible.",
    category: "Follow-up",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
