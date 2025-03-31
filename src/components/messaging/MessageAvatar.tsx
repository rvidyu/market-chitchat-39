
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Global avatar cache to reduce storage requests
const avatarCache: Record<string, { url: string | null, timestamp: number }> = {};
const AVATAR_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour cache expiry

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
    
    let isMounted = true;
    
    // Check if we have a cached avatar URL
    const now = Date.now();
    const cachedAvatar = avatarCache[senderId];
    
    if (cachedAvatar && (now - cachedAvatar.timestamp) < AVATAR_CACHE_EXPIRY) {
      if (isMounted) {
        setAvatarUrl(cachedAvatar.url);
      }
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
          // Check if the file exists with a HEAD request
          const response = await fetch(data.publicUrl, { 
            method: 'HEAD',
            cache: 'force-cache' // Force browser caching
          });
          
          if (!isMounted) return;
          
          if (response.ok) {
            setAvatarUrl(data.publicUrl);
            // Cache the URL
            avatarCache[senderId] = { url: data.publicUrl, timestamp: now };
          } else {
            avatarCache[senderId] = { url: null, timestamp: now };
          }
        }
      } catch (err) {
        console.error("Error fetching avatar:", err);
        if (isMounted) {
          avatarCache[senderId] = { url: null, timestamp: now };
        }
      }
    };
    
    fetchAvatar();
    
    return () => {
      isMounted = false;
    };
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
