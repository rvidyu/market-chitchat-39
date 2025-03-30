
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ConversationItem from "./ConversationItem";
import { Conversation, currentUser } from "@/data/messages";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, Send, Archive, AlertCircle, Trash, FileWarning } from "lucide-react";

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

  // Helper to get count of conversations by filter type
  const getCountByFilter = (filterType: FilterType): number => {
    return conversations.filter((conversation) => {
      switch (filterType) {
        case "inbox":
          return conversation.messages[conversation.messages.length - 1].senderId !== currentUser.id;
        case "sent":
          return conversation.messages[conversation.messages.length - 1].senderId === currentUser.id;
        case "unread":
          return conversation.unreadCount > 0;
        case "all":
          return true;
        default:
          return false;
      }
    }).length;
  };

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
          <TabsList className="w-full h-auto flex flex-wrap gap-1 overflow-x-auto p-1 bg-messaging-background border rounded-md mb-2">
            <TabsTrigger 
              value="inbox" 
              className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs md:text-sm data-[state=active]:bg-messaging-primary data-[state=active]:text-white"
            >
              <Inbox className="h-3.5 w-3.5" /> 
              <span>Inbox</span>
              {getCountByFilter("inbox") > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-messaging-accent text-white text-xs">
                  {getCountByFilter("inbox")}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="sent" 
              className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs md:text-sm data-[state=active]:bg-messaging-primary data-[state=active]:text-white"
            >
              <Send className="h-3.5 w-3.5" /> 
              <span>Sent</span>
              {getCountByFilter("sent") > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-messaging-secondary text-messaging-text text-xs">
                  {getCountByFilter("sent")}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="all" 
              className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs md:text-sm data-[state=active]:bg-messaging-primary data-[state=active]:text-white"
            >
              <Archive className="h-3.5 w-3.5" /> 
              <span>All</span>
              {getCountByFilter("all") > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-messaging-secondary text-messaging-text text-xs">
                  {getCountByFilter("all")}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="unread" 
              className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs md:text-sm data-[state=active]:bg-messaging-primary data-[state=active]:text-white"
            >
              <AlertCircle className="h-3.5 w-3.5" /> 
              <span>Unread</span>
              {getCountByFilter("unread") > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-messaging-accent text-white text-xs">
                  {getCountByFilter("unread")}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="spam" 
              className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs md:text-sm data-[state=active]:bg-messaging-primary data-[state=active]:text-white"
            >
              <FileWarning className="h-3.5 w-3.5" /> 
              <span>Spam</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="trash" 
              className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs md:text-sm data-[state=active]:bg-messaging-primary data-[state=active]:text-white"
            >
              <Trash className="h-3.5 w-3.5" /> 
              <span>Trash</span>
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
          <div className="p-6 text-center">
            <div className="flex flex-col items-center justify-center gap-2 text-messaging-muted">
              {activeFilter === "spam" && (
                <>
                  <FileWarning className="h-10 w-10 text-messaging-muted opacity-50" />
                  <p>No spam messages</p>
                </>
              )}
              {activeFilter === "trash" && (
                <>
                  <Trash className="h-10 w-10 text-messaging-muted opacity-50" />
                  <p>Trash is empty</p>
                </>
              )}
              {activeFilter === "unread" && getCountByFilter("unread") === 0 && (
                <>
                  <AlertCircle className="h-10 w-10 text-messaging-muted opacity-50" />
                  <p>No unread messages</p>
                </>
              )}
              {(activeFilter === "inbox" || activeFilter === "sent" || activeFilter === "all") && filteredConversations.length === 0 && (
                <>
                  {searchQuery ? (
                    <>
                      <Search className="h-10 w-10 text-messaging-muted opacity-50" />
                      <p>No conversations found matching "{searchQuery}"</p>
                    </>
                  ) : (
                    <>
                      <Inbox className="h-10 w-10 text-messaging-muted opacity-50" />
                      <p>No conversations in {activeFilter}</p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
