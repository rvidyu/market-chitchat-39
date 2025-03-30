
import { MessageCircle } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-messaging-background">
      <div className="text-center max-w-md p-8">
        <div className="mx-auto h-16 w-16 rounded-full bg-messaging-secondary flex items-center justify-center mb-6">
          <MessageCircle className="h-8 w-8 text-messaging-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-3">Your Messages</h3>
        <p className="text-messaging-muted mb-6">
          Connect with buyers and sellers about handmade and vintage items. Select a conversation to start messaging.
        </p>
      </div>
    </div>
  );
}
