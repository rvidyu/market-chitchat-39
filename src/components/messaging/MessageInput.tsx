
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image } from "lucide-react";
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
          className="resize-none pr-12 min-h-[60px]"
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
        <div className="absolute bottom-2 right-2 flex gap-2">
          <QuickReplySelector onSelect={handleQuickReplySelect} />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button type="submit" className="bg-messaging-primary hover:bg-messaging-accent">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
