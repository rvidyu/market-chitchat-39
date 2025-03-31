
import { useRef, useEffect } from "react";
import { Message } from "@/data/types";
import MessageBubble from "./MessageBubble";

interface ConversationMessagesProps {
  messages: Message[];
}

export default function ConversationMessages({ messages }: ConversationMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-messaging-background">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
