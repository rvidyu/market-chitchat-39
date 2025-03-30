
import { useState } from "react";
import { conversations, Conversation, currentUser } from "@/data/messages";
import { Input } from "@/components/ui/input";
import { Search, Edit } from "lucide-react";
import ConversationItem from "./ConversationItem";
import ConversationView from "./ConversationView";
import EmptyState from "./EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Messaging() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationsList, setConversationsList] = useState(conversations);
  const { toast } = useToast();

  // Filter conversations based on search query
  const filteredConversations = conversationsList.filter((conversation) => {
    const otherParticipant = conversation.participants.find(
      (participant) => participant.id !== currentUser.id
    );
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Find the active conversation
  const activeConversation = conversationsList.find(
    (conversation) => conversation.id === activeConversationId
  );

  // Handle sending a new message
  const handleSendMessage = (text: string) => {
    if (!activeConversationId) return;

    // Create a new conversations list with the new message
    const updatedConversations = conversationsList.map((conversation) => {
      if (conversation.id === activeConversationId) {
        // Create a new message
        const newMessage = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          text,
          timestamp: new Date().toISOString(),
          isRead: true,
        };

        // Return the updated conversation
        return {
          ...conversation,
          messages: [...conversation.messages, newMessage],
          lastActivity: new Date().toISOString(),
        };
      }
      return conversation;
    });

    // Update the state
    setConversationsList(updatedConversations);

    // Show success toast
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    });
  };

  // Mark messages as read when a conversation is selected
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);

    // Mark all messages in the conversation as read
    const updatedConversations = conversationsList.map((conversation) => {
      if (conversation.id === conversationId) {
        return {
          ...conversation,
          messages: conversation.messages.map((message) => ({
            ...message,
            isRead: true,
          })),
          unreadCount: 0,
        };
      }
      return conversation;
    });

    setConversationsList(updatedConversations);
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] rounded-lg overflow-hidden border shadow-lg">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-messaging-muted" />
            <Input
              placeholder="Search conversations"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => handleSelectConversation(conversation.id)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-messaging-muted">
              No conversations found.
            </div>
          )}
        </div>

        {/* New Message Button */}
        <div className="p-4 border-t">
          <Button className="w-full bg-messaging-primary hover:bg-messaging-accent">
            <Edit className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Conversation View */}
      <div className="hidden md:flex flex-1 flex-col">
        {activeConversation ? (
          <ConversationView
            conversation={activeConversation}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
