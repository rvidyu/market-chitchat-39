
import { useState } from "react";
import MessageInput from "./MessageInput";

interface ConversationFooterProps {
  onSendMessage: (text: string, images?: File[]) => void;
  isBlocked?: boolean;
}

export default function ConversationFooter({ 
  onSendMessage,
  isBlocked = false
}: ConversationFooterProps) {
  return (
    <div className="border-t p-4 bg-white">
      <MessageInput 
        onSendMessage={onSendMessage}
        isBlocked={isBlocked}
      />
    </div>
  );
}
