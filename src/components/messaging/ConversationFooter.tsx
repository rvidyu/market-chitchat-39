
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import MessageInput from "./MessageInput";

interface ConversationFooterProps {
  onSendMessage: (text: string, images?: File[]) => void;
}

export default function ConversationFooter({ onSendMessage }: ConversationFooterProps) {
  return (
    <div className="p-4 border-t bg-white space-y-3">
      <Alert className="bg-yellow-50 border-yellow-100 text-yellow-800 text-xs py-2">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-xs">
          To stay protected, stay on Kifgo. Never follow links to other sites, and don't share contact, account, or financial info with anyone in Messages. Learn how to spot spam.
        </AlertDescription>
      </Alert>
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
