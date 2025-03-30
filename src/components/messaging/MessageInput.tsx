
import { useState, FormEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon } from "lucide-react";
import QuickReplySelector from "./QuickReplySelector";
import ImageUploader from "./ImageUploader";

interface MessageInputProps {
  onSendMessage: (text: string, images?: File[]) => void;
  placeholder?: string;
}

export default function MessageInput({ onSendMessage, placeholder = "Type a message..." }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [showImageUploader, setShowImageUploader] = useState(false);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() || images.length > 0) {
      onSendMessage(message, images);
      setMessage("");
      setImages([]);
      setShowImageUploader(false);
    }
  };
  
  const handleQuickReplySelect = (text: string) => {
    setMessage(text);
  };
  
  const handleImagesSelected = (selectedImages: File[]) => {
    setImages(selectedImages);
  };
  
  const toggleImageUploader = () => {
    setShowImageUploader(prev => !prev);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {showImageUploader && (
        <ImageUploader onImagesSelected={handleImagesSelected} />
      )}
      
      <div className="flex gap-2 items-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-full flex-shrink-0 ${showImageUploader ? 'text-messaging-primary bg-messaging-primary/10' : ''}`}
          onClick={toggleImageUploader}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="resize-none pr-12 min-h-[60px] rounded-full pl-4 focus-visible:ring-messaging-primary shadow-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim() || images.length > 0) {
                  onSendMessage(message, images);
                  setMessage("");
                  setImages([]);
                  setShowImageUploader(false);
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
          className="bg-messaging-primary hover:bg-messaging-accent rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
