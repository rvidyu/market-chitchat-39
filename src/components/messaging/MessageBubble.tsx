
import { Message } from "@/data/types";
import { formatTimestamp } from "@/data/messageUtils";
import { cn } from "@/lib/utils";
import { useMessageUser } from "@/hooks/useMessageUser";
import MessageAvatar from "./MessageAvatar";
import MessageContent from "./MessageContent";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // Use our custom hook to get user information
  const { isCurrentUser, senderName, isLoading } = useMessageUser(message.senderId);
  
  return (
    <div className={cn(
      "flex items-start gap-2 mb-4",
      isCurrentUser ? "flex-row-reverse" : "flex-row",
    )}>
      {/* Avatar with user profile image or fallback */}
      <MessageAvatar 
        senderId={message.senderId}
        isCurrentUser={isCurrentUser}
        senderName={senderName}
      />
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        {/* Only show timestamp */}
        <div className={cn(
          "flex mb-1",
          isCurrentUser ? "justify-end" : "justify-start"
        )}>
          <span className="text-xs text-messaging-muted">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        <div>
          <MessageContent 
            message={message}
            isCurrentUser={isCurrentUser}
            senderName={senderName}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
