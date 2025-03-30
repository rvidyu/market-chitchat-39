
import { useRef, useEffect } from "react";
import { Conversation, currentUser } from "@/data/messages";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ConversationViewProps {
  conversation: Conversation;
  onSendMessage: (text: string, images?: File[]) => void;
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
      
      {/* Message Input with Safety Warning */}
      <div className="p-4 border-t bg-white space-y-3">
        <Alert className="bg-yellow-50 border-yellow-100 text-yellow-800 text-xs py-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-xs">
            To stay protected, stay on Kifgo. Never follow links to other sites, and don't share contact, account, or financial info with anyone in Messages. Learn how to spot spam.
          </AlertDescription>
        </Alert>
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
