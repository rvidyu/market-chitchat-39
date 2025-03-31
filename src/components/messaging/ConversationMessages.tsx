
import { useRef, useEffect, useState } from "react";
import { Message } from "@/data/types";
import MessageBubble from "./MessageBubble";
import { Loader2 } from "lucide-react";

interface ConversationMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function ConversationMessages({ 
  messages, 
  isLoading = false 
}: ConversationMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: hasScrolled ? "smooth" : "auto" });
      if (!hasScrolled) setHasScrolled(true);
    }
  }, [messages, hasScrolled]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-messaging-background">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 text-messaging-primary animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex justify-center items-center h-full text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </>
      )}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
