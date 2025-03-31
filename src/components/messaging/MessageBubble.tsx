
import { Message } from "@/data/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageImageAttachment from "./MessageImageAttachment";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");
  const [senderAvatar, setSenderAvatar] = useState<string>("");
  
  // Get current user ID and sender info
  useEffect(() => {
    const fetchUserData = async () => {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setCurrentUserId(userData.user.id);
      }
      
      // Get sender's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', message.senderId)
        .single();
      
      if (profileData) {
        setSenderName(profileData.name || "Unknown User");
      }
    };
    
    fetchUserData();
  }, [message.senderId]);
  
  const isCurrentUser = message.senderId === currentUserId;
  const hasContent = message.text.trim().length > 0;
  const hasImages = message.images && message.images.length > 0;
  
  return (
    <div className={cn(
      "flex gap-2 mb-4",
      isCurrentUser ? "flex-row-reverse" : ""
    )}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback>{senderName.split(" ").map((n) => n?.[0] || "").join("")}</AvatarFallback>
        </Avatar>
      )}
      
      <div className="max-w-[70%]">
        {!isCurrentUser && (
          <div className="text-xs text-messaging-muted ml-1 mb-1">{senderName}</div>
        )}
        
        <div className={cn(
          "px-4 py-2 rounded-2xl",
          isCurrentUser 
            ? "bg-messaging-primary text-white rounded-tr-none" 
            : "bg-messaging-secondary text-messaging-text rounded-tl-none",
          !hasContent && "py-1"
        )}>
          {hasContent && message.text}
          
          {hasImages && (
            <MessageImageAttachment 
              images={message.images} 
              className={hasContent ? "mt-2" : "m-0"}
            />
          )}
        </div>
        
        {message.product && (
          <div className="mt-2 border rounded-md p-2 bg-white">
            <div className="flex items-center gap-2">
              <img 
                src={message.product.image} 
                alt={message.product.name} 
                className="h-12 w-12 object-cover rounded"
              />
              <div>
                <div className="text-sm font-medium">{message.product.name}</div>
                <div className="text-xs text-messaging-muted">{message.product.price}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className={cn(
          "text-xs text-messaging-muted mt-1",
          isCurrentUser ? "text-right" : "text-left"
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
