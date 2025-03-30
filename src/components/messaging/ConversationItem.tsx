
import { useState } from "react";
import { Conversation, User, formatTimestamp, currentUser } from "@/data/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trash2, AlertCircle, Check } from "lucide-react";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  // Find the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    (participant) => participant.id !== currentUser.id
  ) as User;
  
  // Get the last message in the conversation
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const isLastMessageFromCurrentUser = lastMessage.senderId === currentUser.id;
  
  // Determine message status
  const isDeleted = false; // This would be determined by your data model
  const isSpam = false; // This would be determined by your data model
  const isUnread = conversation.unreadCount > 0 && !isLastMessageFromCurrentUser;
  const isRead = !isUnread;

  // Function to render the appropriate status icon
  const renderStatusIcon = () => {
    if (isDeleted) {
      return <Trash2 className="h-3.5 w-3.5 text-gray-400" />;
    } else if (isSpam) {
      return <AlertCircle className="h-3.5 w-3.5 text-orange-500" />;
    } else if (isUnread) {
      return <div className="h-3 w-3 rounded-full bg-messaging-primary"></div>;
    } else if (isRead) {
      return <Check className="h-3.5 w-3.5 text-green-500" />;
    }
    return null;
  };
  
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-colors rounded-md mx-1 my-0.5",
        isActive 
          ? "bg-messaging-primary bg-opacity-10 border-l-4 border-messaging-primary" 
          : "hover:bg-gray-50 border-l-4 border-transparent"
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
          <div className="flex items-center">
            <h3 className={cn(
              "font-medium truncate",
              isActive ? "text-messaging-primary" : "text-messaging-text"
            )}>
              {otherParticipant.name}
            </h3>
            
            {/* Status indicator */}
            <div className="ml-2 flex items-center">
              {renderStatusIcon()}
            </div>
          </div>
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
    </div>
  );
}
