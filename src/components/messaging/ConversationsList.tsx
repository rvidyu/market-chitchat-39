
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ConversationItem from "./ConversationItem";
import { Conversation, currentUser } from "@/data/messages";
import { Inbox, Send, Archive, AlertCircle } from "lucide-react";
import FilterBar from "./FilterBar";
import EmptyFilterState from "./EmptyFilterState";
import { FilterType, FilterOption } from "./types/FilterTypes";

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export default function ConversationsList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("inbox");

  // Count unread messages
  const unreadCount = conversations.reduce((count, conv) => count + conv.unreadCount, 0);

  // Count sent messages (where last message is from current user)
  const sentCount = conversations.filter(conv => {
    const lastMessage = conv.messages[conv.messages.length - 1];
    return lastMessage.senderId === currentUser.id;
  }).length;

  // Define filter options
  const filterOptions: FilterOption[] = [
    { value: "inbox", label: "Inbox", icon: <Inbox className="h-4 w-4" /> },
    { value: "sent", label: "Sent", icon: <Send className="h-4 w-4" />, count: sentCount },
    { value: "all", label: "All", icon: <Archive className="h-4 w-4" /> },
    { value: "unread", label: "Unread", icon: <AlertCircle className="h-4 w-4" />, count: unreadCount },
    { value: "spam", label: "Spam", icon: <AlertCircle className="h-4 w-4" /> },
  ];

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
    }

    return matchesSearch && matchesFilter;
  });

  // Get the appropriate icon for empty state display
  const getEmptyStateIcon = () => {
    switch (activeFilter) {
      case "inbox": 
        return <Inbox className="h-5 w-5 text-gray-400" />;
      case "sent": 
        return <Send className="h-5 w-5 text-gray-400" />;
      case "unread": 
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      case "all": 
        return <Archive className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
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

        {/* Modernized Filter Tabs */}
        <FilterBar 
          filterOptions={filterOptions}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <>
            <div className="py-2 px-4">
              <h3 className="text-xs uppercase tracking-wider font-medium text-gray-500">
                {activeFilter === "inbox" ? "Inbox" : 
                 activeFilter === "sent" ? "Sent Messages" :
                 activeFilter === "unread" ? "Unread Messages" :
                 activeFilter === "all" ? "All Messages" :
                 "Spam"}
              </h3>
            </div>
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </>
        ) : (
          <EmptyFilterState 
            activeFilter={activeFilter}
            icon={getEmptyStateIcon()}
          />
        )}
      </div>
    </>
  );
}
