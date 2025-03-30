
import { useRef, useEffect } from "react";
import { Conversation, currentUser } from "@/data/messages";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationViewProps {
  conversation: Conversation;
  onSendMessage: (text: string) => void;
}

export default function ConversationView({ conversation, onSendMessage }: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUser.id
  );
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);
  
  if (!otherParticipant) return null;
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
            <AvatarFallback>
              {otherParticipant.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherParticipant.name}</h3>
            <p className="text-sm text-messaging-muted">
              {otherParticipant.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-messaging-background">
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
