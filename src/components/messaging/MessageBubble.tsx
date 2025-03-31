
import { useState, useEffect } from "react";
import { Message } from "@/data/types";
import { formatTimestamp } from "@/data/messageUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [senderName, setSenderName] = useState("");
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsCurrentUser(message.senderId === user.id);
        
        // Get sender's name from profiles
        const { data: senderProfile, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', message.senderId)
          .single();
          
        if (error) {
          console.error("Error fetching sender profile:", error);
          setSenderName(message.senderId.substring(0, 8));
        } else {
          setSenderName(senderProfile?.name || message.senderId.substring(0, 8));
        }
      }
    };
    
    checkUser();
  }, [message.senderId]);
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };
  
  return (
    <div className={cn(
      "flex items-start gap-2 mb-4",
      isCurrentUser ? "flex-row-reverse" : "",
    )}>
      <Avatar className={cn(
        "h-8 w-8",
        isCurrentUser ? "bg-messaging-primary" : "bg-messaging-secondary",
      )}>
        <AvatarImage src="" alt={senderName} />
        <AvatarFallback className={cn(
          isCurrentUser 
            ? "bg-messaging-primary text-white" 
            : "bg-messaging-secondary text-messaging-primary"
        )}>
          {getInitials(senderName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[80%]">
        <div className="flex items-center mb-1">
          <span className={cn(
            "text-xs text-messaging-muted",
            isCurrentUser ? "order-2 ml-2" : "order-1 mr-2"
          )}>
            {senderName}
          </span>
          <span className={cn(
            "text-xs text-messaging-muted",
            isCurrentUser ? "order-1 mr-2" : "order-2 ml-2"
          )}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        <div>
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
              {message.images.map((imageUrl, index) => (
                <MessageImageAttachment 
                  key={index} 
                  imageUrl={imageUrl} 
                  altText={`Image ${index+1}`} 
                />
              ))}
            </div>
          )}
          
          {/* Read Receipt */}
          {isCurrentUser && message.isRead && (
            <div className="flex justify-end mt-1">
              <CheckCircle className="h-3 w-3 text-messaging-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
