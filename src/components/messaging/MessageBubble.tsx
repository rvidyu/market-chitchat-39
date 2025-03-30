
import { Message, User, currentUser, getUserById, formatTimestamp } from "@/data/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isCurrentUser = message.senderId === currentUser.id;
  const sender = isCurrentUser ? currentUser : getUserById(message.senderId);
  
  if (!sender) return null;
  
  return (
    <div className={cn(
      "flex gap-2 mb-4",
      isCurrentUser ? "flex-row-reverse" : ""
    )}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback>{sender.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
        </Avatar>
      )}
      
      <div className="max-w-[70%]">
        {!isCurrentUser && (
          <div className="text-xs text-messaging-muted ml-1 mb-1">{sender.name}</div>
        )}
        
        <div className={cn(
          "px-4 py-2 rounded-2xl",
          isCurrentUser 
            ? "bg-messaging-primary text-white rounded-tr-none" 
            : "bg-messaging-secondary text-messaging-text rounded-tl-none"
        )}>
          {message.text}
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
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
