
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface MessageAvatarProps {
  senderId: string;
  isCurrentUser: boolean;
  senderName: string;
}

export default function MessageAvatar({ 
  senderId, 
  isCurrentUser, 
  senderName 
}: MessageAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Optimize avatar fetching to reduce unnecessary network requests
  useEffect(() => {
    if (!senderId) return;
    
    // Create a cache key based on the sender ID
    const cacheKey = `avatar_${senderId}`;
    
    // Check if we have a cached avatar URL
    const cachedUrl = sessionStorage.getItem(cacheKey);
    if (cachedUrl) {
      setAvatarUrl(cachedUrl !== "null" ? cachedUrl : null);
      return;
    }
    
    // Fetch avatar for the message sender
    const fetchAvatar = async () => {
      try {
        // Get public URL from Supabase storage
        const { data } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(`${senderId}/avatar`);
        
        if (data?.publicUrl) {
          // Check if the file exists by making a HEAD request
          fetch(data.publicUrl, { method: 'HEAD' })
            .then(response => {
              if (response.ok) {
                setAvatarUrl(data.publicUrl);
                // Cache the URL in session storage
                sessionStorage.setItem(cacheKey, data.publicUrl);
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
  }, [senderId]);

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!senderName) return "U";
    return senderName.split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
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
          {isCurrentUser ? "You" : getInitials()}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
