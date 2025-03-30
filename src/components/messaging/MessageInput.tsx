
import { useState, FormEvent, useRef, useEffect } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  const handleQuickReplySelect = (text: string) => {
    setMessage(text);
    // Focus the textarea after selecting a quick reply
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150); // Max height of 150px
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="resize-none pr-12 min-h-[60px] max-h-[150px] border-gray-200 focus:border-messaging-primary transition-colors rounded-2xl pl-4 py-3 shadow-sm focus:shadow"
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
        size="icon"
        className={`rounded-full bg-messaging-primary hover:bg-messaging-accent h-12 w-12 shadow-md hover:shadow-lg ${!message.trim() ? 'opacity-70' : 'opacity-100'} transition-all`}
        disabled={!message.trim()}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
