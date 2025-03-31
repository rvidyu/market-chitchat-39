
// Quick reply templates
export interface QuickReply {
  id: string;
  text: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Template quick replies that can be used when setting up a new account
// These are not stored as mock data but represent suggested templates
export const initialQuickReplies: QuickReply[] = [];
