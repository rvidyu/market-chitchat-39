
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import QuickReplySelector from "./QuickReplySelector";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  placeholder?: string;
}

export default function MessageInput({ onSendMessage, placeholder = "Type a message..." }: MessageInputProps) {
  const [message, setMessage] = useState("");
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  const handleQuickReplySelect = (text: string) => {
    setMessage(text);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="resize-none pr-12 min-h-[60px] rounded-full pl-4 focus-visible:ring-messaging-primary shadow-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (message.trim()) {
                onSendMessage(message);
                setMessage("");
              }
            }
          }}
        />
        <div className="absolute bottom-3 right-3">
          <QuickReplySelector onSelect={handleQuickReplySelect} />
        </div>
      </div>
      <Button 
        type="submit" 
        className="bg-messaging-primary hover:bg-messaging-accent rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
