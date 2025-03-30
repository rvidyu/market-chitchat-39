
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
      "flex gap-2 mb-6 group animate-fade-in",
      isCurrentUser ? "flex-row-reverse" : ""
    )}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mt-1 border border-gray-100">
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback className="bg-messaging-secondary/30 text-messaging-primary text-xs">
            {sender.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[80%] sm:max-w-[70%]",
        isCurrentUser ? "items-end" : "items-start"
      )}>
        {!isCurrentUser && (
          <div className="text-xs text-messaging-muted ml-1 mb-1">{sender.name}</div>
        )}
        
        <div className={cn(
          "px-4 py-3 rounded-2xl shadow-sm",
          isCurrentUser 
            ? "bg-messaging-primary text-white rounded-tr-none" 
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
        )}>
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        
        {message.product && (
          <div className="mt-2 border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <img 
                src={message.product.image} 
                alt={message.product.name} 
                className="h-14 w-14 object-cover rounded"
              />
              <div>
                <div className="text-sm font-medium">{message.product.name}</div>
                <div className="text-xs text-messaging-primary font-semibold">{message.product.price}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className={cn(
          "text-xs text-messaging-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isCurrentUser ? "text-right mr-1" : "text-left ml-1"
        )}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
