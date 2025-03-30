
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ConversationItem from "./ConversationItem";
import { Conversation, currentUser } from "@/data/messages";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, Send, Archive, AlertCircle, Trash } from "lucide-react";

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

// Filter types for categorizing messages
type FilterType = "inbox" | "sent" | "all" | "unread" | "spam" | "trash";

export default function ConversationsList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("inbox");

  // Filter conversations based on search query and active filter
  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = conversation.participants.find(
      (participant) => participant.id !== currentUser.id
    );

    // Name search filter
    const matchesSearch = otherParticipant?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category filter logic
    let matchesFilter = true;
    switch (activeFilter) {
      case "inbox":
        // Messages where the current user is the recipient (not the last sender)
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        matchesFilter = lastMessage.senderId !== currentUser.id;
        break;
      case "sent":
        // Messages where the current user is the last sender
        const lastSentMessage = conversation.messages[conversation.messages.length - 1];
        matchesFilter = lastSentMessage.senderId === currentUser.id;
        break;
      case "unread":
        // Conversations with unread messages
        matchesFilter = conversation.unreadCount > 0;
        break;
      case "all":
        // All conversations
        matchesFilter = true;
        break;
      case "spam":
        // In a real app, this would filter spam-flagged messages
        // For demo purposes, we'll just return no results
        matchesFilter = false;
        break;
      case "trash":
        // In a real app, this would show deleted conversations
        // For demo purposes, we'll just return no results
        matchesFilter = false;
        break;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div className="p-4 border-b">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-messaging-muted" />
          <Input
            placeholder="Search conversations"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <Tabs 
          defaultValue="inbox" 
          value={activeFilter}
          onValueChange={(value) => setActiveFilter(value as FilterType)}
          className="w-full"
        >
          <TabsList className="w-full h-auto flex overflow-x-auto py-1 bg-gray-100 border rounded-md mb-2">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" /> Inbox
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="h-4 w-4" /> Sent
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Archive className="h-4 w-4" /> All
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Unread
            </TabsTrigger>
            <TabsTrigger value="spam" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Spam
            </TabsTrigger>
            <TabsTrigger value="trash" className="flex items-center gap-2">
              <Trash className="h-4 w-4" /> Trash
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-messaging-muted">
            {activeFilter === "spam" || activeFilter === "trash" 
              ? `No conversations in ${activeFilter}.` 
              : "No conversations found."}
          </div>
        )}
      </div>
    </>
  );
}
