
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ConversationItem from "./ConversationItem";
import { Conversation, currentUser } from "@/data/messages";
import { cn } from "@/lib/utils";
import { Inbox, Send, Archive, AlertCircle } from "lucide-react";

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

// Filter types for categorizing messages
type FilterType = "inbox" | "sent" | "all" | "unread" | "spam";

interface FilterOption {
  value: FilterType;
  label: string;
  icon: React.ReactNode;
  count?: number;
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
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Filter Messages</h3>
            <button 
              className="text-xs text-messaging-primary hover:text-messaging-accent transition-colors"
              onClick={() => setActiveFilter("inbox")}
            >
              Reset
            </button>
          </div>
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full transition-all text-sm",
                  activeFilter === option.value 
                    ? "bg-messaging-primary text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {option.icon}
                <span>{option.label}</span>
                {option.count !== undefined && option.count > 0 && (
                  <span className={cn(
                    "inline-flex items-center justify-center rounded-full text-xs font-medium",
                    activeFilter === option.value 
                      ? "bg-white text-messaging-primary h-5 min-w-5 px-1" 
                      : "bg-messaging-primary text-white h-4 min-w-4 px-1"
                  )}>
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
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
          <div className="flex flex-col items-center justify-center h-40 text-center p-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              {activeFilter === "inbox" ? <Inbox className="h-5 w-5 text-gray-400" /> : 
               activeFilter === "sent" ? <Send className="h-5 w-5 text-gray-400" /> :
               activeFilter === "unread" ? <AlertCircle className="h-5 w-5 text-gray-400" /> :
               activeFilter === "all" ? <Archive className="h-5 w-5 text-gray-400" /> :
               <AlertCircle className="h-5 w-5 text-gray-400" />}
            </div>
            <p className="text-sm font-medium text-gray-600">No {activeFilter} messages</p>
            <p className="text-xs text-gray-500 mt-1">
              {activeFilter === "inbox" ? "Your inbox is empty" : 
               activeFilter === "sent" ? "You haven't sent any messages" :
               activeFilter === "unread" ? "No unread messages" :
               activeFilter === "spam" ? "No spam detected" : 
               "No messages found"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

