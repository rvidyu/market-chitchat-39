import { Message } from "@/data/types";
import { formatTimestamp } from "@/data/messageUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductMessageCard from "./ProductMessageCard";
import MessageImageAttachment from "./MessageImageAttachment";
import { useMessageUser } from "@/hooks/useMessageUser";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // Use our custom hook to get user information
  const { isCurrentUser, senderName, isLoading } = useMessageUser(message.senderId);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Fetch avatar for the message sender
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        if (!message.senderId) return;
        
        const { data: publicUrl } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(`${message.senderId}/avatar`);
        
        if (publicUrl?.publicUrl) {
          // Check if the file exists by making a HEAD request
          const response = await fetch(publicUrl.publicUrl, { method: 'HEAD' })
            .catch(() => ({ ok: false })); // Handle network errors gracefully
            
          if (response.ok) {
            setAvatarUrl(publicUrl.publicUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching avatar:", err);
        // Don't set error state, just keep the avatar as null
      }
    };
    
    if (message.senderId) {
      fetchAvatar();
    }
  }, [message.senderId]);
  
  // Dynamic rendering for optimal performance
  const renderMessageContent = () => (
    <>
      {/* Display full sender name at the top of the message bubble if not current user */}
      {!isCurrentUser && (
        <div className="mb-1 text-sm font-medium text-messaging-primary">
          {isLoading ? "User" : senderName}
        </div>
      )}
      
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
      {/* Avatar with user profile image or fallback */}
      <Avatar className={cn(
        "h-8 w-8",
        isCurrentUser ? "bg-messaging-primary" : "bg-messaging-secondary",
      )}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={senderName} />
        ) : (
          <AvatarFallback className={cn(
            isCurrentUser 
              ? "bg-messaging-primary text-white" 
              : "bg-messaging-secondary text-messaging-primary"
          )}>
            {isCurrentUser ? "You" : senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex flex-col max-w-[80%]">
        {/* This section is now removed since we're displaying the name inside the message bubble */}
        {isCurrentUser && (
          <div className="flex items-center mb-1 justify-end">
            <span className="text-xs text-messaging-muted">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
        )}
        
        <div>
          {renderMessageContent()}
        </div>
        
        {/* Timestamp for non-current user messages */}
        {!isCurrentUser && (
          <div className="flex items-center mt-1">
            <span className="text-xs text-messaging-muted">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
