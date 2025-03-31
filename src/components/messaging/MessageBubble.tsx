
import { Message } from "@/data/types";
import { formatTimestamp } from "@/data/messageUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductMessageCard from "./ProductMessageCard";
import MessageImageAttachment from "./MessageImageAttachment";
import { useMessageUser } from "@/hooks/useMessageUser";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // Use our custom hook to get user information
  const { isCurrentUser, senderName, isLoading } = useMessageUser(message.senderId);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Optimize avatar fetching to reduce unnecessary network requests
  useEffect(() => {
    if (!message.senderId) return;
    
    // Create a cache key based on the sender ID
    const cacheKey = `avatar_${message.senderId}`;
    
    // Check if we have a cached avatar URL
    const cachedUrl = sessionStorage.getItem(cacheKey);
    if (cachedUrl) {
      setAvatarUrl(cachedUrl !== "null" ? cachedUrl : null);
      return;
    }
    
    // Fetch avatar for the message sender
    const fetchAvatar = async () => {
      try {
        const { data: publicUrl } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(`${message.senderId}/avatar`);
        
        if (publicUrl?.publicUrl) {
          // Check if the file exists by making a HEAD request
          fetch(publicUrl.publicUrl, { method: 'HEAD' })
            .then(response => {
              if (response.ok) {
                setAvatarUrl(publicUrl.publicUrl);
                // Cache the URL in session storage
                sessionStorage.setItem(cacheKey, publicUrl.publicUrl);
              } else {
                sessionStorage.setItem(cacheKey, "null");
              }
            })
            .catch(() => {
              sessionStorage.setItem(cacheKey, "null");
            });
        }
      } catch (err) {
        console.error("Error fetching avatar:", err);
        sessionStorage.setItem(cacheKey, "null");
      }
    };
    
    fetchAvatar();
  }, [message.senderId]);
  
  // Use useMemo to prevent unnecessary re-renders
  const messageContent = useMemo(() => (
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
        {/* Show full name for non-current user messages */}
        {!isCurrentUser && !isLoading && (
          <div className="font-medium text-sm mb-1">{senderName}</div>
        )}
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
  ), [message, isCurrentUser, isLoading, senderName]);
  
  // Get initials for avatar fallback
  const getInitials = useMemo(() => {
    return senderName.charAt(0).toUpperCase();
  }, [senderName]);
  
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
            {isCurrentUser ? "You" : getInitials}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex flex-col max-w-[80%]">
        {/* Only show timestamp */}
        <div className="flex items-center mb-1">
          <span className="text-xs text-messaging-muted">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        <div>
          {messageContent}
        </div>
      </div>
    </div>
  );
}
