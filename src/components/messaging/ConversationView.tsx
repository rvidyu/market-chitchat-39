
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-messaging-primary/20">
            <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
            <AvatarFallback className="bg-messaging-primary/10 text-messaging-primary">
              {otherParticipant.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-800">{otherParticipant.name}</h3>
            <p className="text-sm text-messaging-muted">
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${otherParticipant.isOnline ? "bg-green-500" : "bg-gray-300"}`}></span>
              {otherParticipant.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-messaging-background">
        <div className="max-w-3xl mx-auto space-y-4">
          {conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="max-w-3xl mx-auto">
          <MessageInput onSendMessage={onSendMessage} />
        </div>
      </div>
    </div>
  );
}
