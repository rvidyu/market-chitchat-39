
import { useState, useEffect } from "react";
import { Message } from "@/data/types";
import { formatTimestamp } from "@/data/messageUtils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductMessageCard from "./ProductMessageCard";
import MessageImageAttachment from "./MessageImageAttachment";
import { supabase } from "@/integrations/supabase/client";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  
  // Only check if message is from current user, don't fetch name
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsCurrentUser(message.senderId === user.id);
      }
    };
    
    checkUser();
  }, [message.senderId]);
  
  // Dynamic rendering for optimal performance
  const renderMessageContent = () => (
    <>
      {/* Product Card (if any) */}
      {message.product && (
        <ProductMessageCard product={message.product} />
      )}
      
      {/* Text Message */}
      <div className={cn(
        "py-2 px-3 rounded-lg",
        isCurrentUser
          ? "bg-messaging-primary text-white rounded-tr-none"
          : "bg-gray-100 text-messaging-text rounded-tl-none"
      )}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
      
      {/* Image Attachments (if any) */}
      {message.images && message.images.length > 0 && (
        <div className="mt-2">
          <MessageImageAttachment images={message.images} />
        </div>
      )}
      
      {/* Read Receipt */}
      {isCurrentUser && message.isRead && (
        <div className="flex justify-end mt-1">
          <CheckCircle className="h-3 w-3 text-messaging-primary" />
        </div>
      )}
    </>
  );
  
  return (
    <div className={cn(
      "flex items-start gap-2 mb-4",
      isCurrentUser ? "flex-row-reverse" : "",
    )}>
      {/* Simplified avatar that just shows "You" or "UB" for user/buyer */}
      <Avatar className={cn(
        "h-8 w-8",
        isCurrentUser ? "bg-messaging-primary" : "bg-messaging-secondary",
      )}>
        <AvatarFallback className={cn(
          isCurrentUser 
            ? "bg-messaging-primary text-white" 
            : "bg-messaging-secondary text-messaging-primary"
        )}>
          {isCurrentUser ? "UB" : "S"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[80%]">
        <div className="flex items-center mb-1">
          {/* Only show timestamp, no names */}
          <span className="text-xs text-messaging-muted">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        <div>
          {renderMessageContent()}
        </div>
      </div>
    </div>
  );
}
