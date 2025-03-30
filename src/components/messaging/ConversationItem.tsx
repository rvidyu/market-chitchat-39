
import { useState } from "react";
import { Conversation, User, formatTimestamp, currentUser } from "@/data/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-md",
        isActive && "bg-messaging-background border-l-4 border-messaging-accent"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
          <AvatarFallback>
            {otherParticipant.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        {otherParticipant.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-messaging-text truncate">
            {otherParticipant.name}
          </h3>
          <span className="text-xs text-messaging-muted">
            {formatTimestamp(conversation.lastActivity)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-messaging-muted truncate max-w-[180px]">
            {lastMessage.senderId === currentUser.id ? "You: " : ""}{lastMessage.text}
          </p>
          
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="bg-messaging-accent">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
