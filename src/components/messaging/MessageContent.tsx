
import { Message } from "@/data/types";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import ProductMessageCard from "./ProductMessageCard";
import MessageImageAttachment from "./MessageImageAttachment";

interface MessageContentProps {
  message: Message;
  isCurrentUser: boolean;
  senderName: string;
  isLoading: boolean;
}

export default function MessageContent({
  message,
  isCurrentUser,
  senderName,
  isLoading
}: MessageContentProps) {
  return (
    <div className="flex flex-col">
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
          <MessageImageAttachment images={message.images} />
        </div>
      )}
      
      {/* Read Receipt */}
      {isCurrentUser && message.isRead && (
        <div className="flex justify-end mt-1">
          <CheckCircle className="h-3 w-3 text-messaging-primary" />
        </div>
      )}
    </div>
  );
}
