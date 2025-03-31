
import { useState } from "react";
import { Conversation, User, formatTimestamp, currentUser } from "@/data/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle } from "lucide-react";

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
  // Find the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    (participant) => participant.id !== currentUser.id
  ) as User;
  
  // Get the last message in the conversation
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const isLastMessageFromCurrentUser = lastMessage.senderId === currentUser.id;
  
  const handleMarkNotSpam = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkNotSpam) {
      onMarkNotSpam(conversation.id);
    }
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
          <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
          <AvatarFallback className="bg-messaging-secondary text-messaging-primary font-medium">
            {otherParticipant.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        {otherParticipant.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={cn(
            "font-medium truncate",
            isActive ? "text-messaging-primary" : "text-messaging-text"
          )}>
            {otherParticipant.name}
            {isSpam && (
              <Badge variant="destructive" className="ml-2 bg-red-500">
                <Flag className="h-3 w-3 mr-1" /> Spam
              </Badge>
            )}
          </h3>
          <span className="text-xs text-messaging-muted whitespace-nowrap ml-2">
            {formatTimestamp(lastMessage.timestamp)}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className={cn(
            "text-sm truncate max-w-[180px]",
            conversation.unreadCount > 0 && !isLastMessageFromCurrentUser ? "font-medium text-messaging-text" : "text-messaging-muted"
          )}>
            {isLastMessageFromCurrentUser ? (
              <span className="text-messaging-muted">You: </span>
            ) : null}
            {lastMessage.text}
          </p>
          
          {conversation.unreadCount > 0 && !isLastMessageFromCurrentUser && (
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
