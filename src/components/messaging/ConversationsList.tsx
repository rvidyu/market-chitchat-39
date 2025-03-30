
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import ConversationItem from "./ConversationItem";
import { Conversation, currentUser } from "@/data/messages";

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

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = conversation.participants.find(
      (participant) => participant.id !== currentUser.id
    );
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <div className="p-4 border-b bg-white">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-messaging-muted" />
          <Input
            placeholder="Search conversations"
            className="pl-10 pr-4 py-2 rounded-full border-gray-200 focus:border-messaging-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto bg-white">
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
          <div className="p-6 text-center text-messaging-muted">
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 rounded-full bg-messaging-secondary/50 flex items-center justify-center">
                <Search className="h-5 w-5 text-messaging-primary" />
              </div>
            </div>
            <p className="text-sm">No conversations found.</p>
          </div>
        )}
      </div>

      {/* New Message Button */}
      <div className="p-4 border-t bg-white">
        <Button className="w-full rounded-full bg-messaging-primary hover:bg-messaging-accent h-11">
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>
    </>
  );
}
