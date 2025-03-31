
import { useState, useEffect } from "react";
import { Conversation, User } from "@/data/types";
import { formatTimestamp } from "@/data/messageUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  isSpam?: boolean;
  onMarkNotSpam?: (id: string) => void;
}

export default function ConversationItem({ 
  conversation, 
  isActive, 
  onClick, 
  isSpam = false,
  onMarkNotSpam 
}: ConversationItemProps) {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [otherUserName, setOtherUserName] = useState<string>("User");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingProfile(true);
      try {
        // Get current user ID
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setCurrentUserId(userData.user.id);
          
          // Find the other participant
          const otherParticipantId = conversation.participants.find(
            p => p.id !== userData.user.id
          )?.id;
          
          if (otherParticipantId) {
            // Fetch their profile
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', otherParticipantId)
              .single();
              
            if (error) {
              console.error("Error fetching other user profile:", error);
              setOtherUserName(`User ${otherParticipantId.substring(0, 8)}`);
            } else if (profileData) {
              // Use the full name from profile
              setOtherUserName(profileData.name || `User ${otherParticipantId.substring(0, 4)}`);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchUserData();
  }, [conversation.participants]);
  
  // Find the other participant
  const otherParticipant = conversation.participants.find(
    (participant) => participant.id !== currentUserId
  ) as User;
  
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const isLastMessageFromCurrentUser = lastMessage?.senderId === currentUserId;
  
  // Don't show unread badge when conversation is active
  const showUnreadBadge = !isActive && conversation.unreadCount > 0 && !isLastMessageFromCurrentUser;
  
  const handleMarkNotSpam = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkNotSpam) {
      onMarkNotSpam(conversation.id);
    }
  };
  
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
    <div
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-colors rounded-md mx-1 my-0.5 relative",
        isActive 
          ? "bg-messaging-primary bg-opacity-10 border-l-4 border-messaging-primary" 
          : "hover:bg-gray-50 border-l-4 border-transparent",
        isSpam ? "bg-red-50" : ""
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className={cn(
          "h-12 w-12 ring-2 ring-offset-2",
          isActive ? "ring-messaging-primary ring-opacity-50" : "ring-transparent"
        )}>
          <AvatarImage src={otherParticipant?.avatar} alt={otherUserName} />
          <AvatarFallback className="bg-messaging-secondary text-messaging-primary font-medium">
            {getInitials(otherUserName)}
          </AvatarFallback>
        </Avatar>
        {otherParticipant?.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={cn(
            "font-medium truncate",
            isActive ? "text-messaging-primary" : "text-messaging-text"
          )}>
            {isLoadingProfile ? "Loading..." : otherUserName}
            {isSpam && (
              <Badge variant="destructive" className="ml-2 bg-red-500">
                <Flag className="h-3 w-3 mr-1" /> Spam
              </Badge>
            )}
          </h3>
          <span className="text-xs text-messaging-muted whitespace-nowrap ml-2">
            {lastMessage && formatTimestamp(lastMessage.timestamp)}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className={cn(
            "text-sm truncate max-w-[180px]",
            showUnreadBadge ? "font-medium text-messaging-text" : "text-messaging-muted"
          )}>
            {isLastMessageFromCurrentUser ? (
              <span className="text-messaging-muted">You: </span>
            ) : null}
            {lastMessage?.text}
          </p>
          
          {showUnreadBadge && (
            <Badge variant="default" className="bg-messaging-primary ml-2">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
      
      {isSpam && onMarkNotSpam && (
        <Button 
          variant="outline" 
          size="sm"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          onClick={handleMarkNotSpam}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Not spam
        </Button>
      )}
    </div>
  );
}
