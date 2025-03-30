
import { MessageSquare } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-gradient-to-b from-gray-50 to-messaging-background">
      <div className="text-center p-6 max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-messaging-secondary/20 flex items-center justify-center text-messaging-primary">
            <MessageSquare className="h-8 w-8" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Conversation Selected</h2>
        <p className="text-messaging-muted text-lg">
          Choose a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
}
