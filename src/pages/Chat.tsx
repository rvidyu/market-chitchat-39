import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Messaging from "@/components/messaging/Messaging";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Store, MessageSquare, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { conversations } from "@/data/messages";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import QuickReplyManager from "@/components/messaging/QuickReplyManager";
import { Button } from "@/components/ui/button";

const Chat = () => {
  const { user } = useAuth();
  const { sellerId, productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [quickReplyManagerOpen, setQuickReplyManagerOpen] = useState(false);

  useEffect(() => {
    if (location.state?.conversationId) {
      setActiveConversationId(location.state.conversationId);
    }

    if (sellerId && productId && location.state?.initialMessage) {
      console.log("Opening chat with seller:", sellerId, "about product:", productId);
      
      const existingConversation = conversations.find(conv => 
        conv.participants.some(p => p.id === sellerId)
      );
      
      const conversationId = existingConversation ? existingConversation.id : `new-conv-${Date.now()}`;
      setActiveConversationId(conversationId);
      
      if (location.state?.initialMessage && !location.state.messageSent) {
        toast({
          title: "Message sent",
          description: `Your message about "${location.state.productName}" has been sent to the seller.`,
        });
        
        navigate(`/chat/${sellerId}/${productId}`, {
          state: {
            ...location.state,
            messageSent: true,
            conversationId
          },
          replace: true
        });
      }
    }
  }, [location.state, sellerId, productId, navigate]);

  const handleMarkNotSpam = () => {
    toast({
      title: "Marked as not spam",
      description: "The conversation has been moved back to your inbox.",
      variant: "success",
      className: "bg-white border-green-200",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
                <p className="text-gray-500 mb-4">
                  You need to be logged in to access your messages.
                </p>
                <button 
                  onClick={() => navigate("/login")}
                  className="bg-messaging-primary hover:bg-messaging-accent text-white px-4 py-2 rounded"
                >
                  Sign In
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center text-messaging-primary">
            <MessageSquare className="mr-2 h-6 w-6" /> Messages
          </h1>
          
          <Button
            onClick={() => setQuickReplyManagerOpen(true)}
            variant="outline"
            className="border-messaging-primary text-messaging-primary hover:bg-messaging-primary/10"
          >
            Manage Quick Replies
          </Button>
        </div>
        
        <Messaging 
          initialConversationId={activeConversationId} 
          onNotSpamMarked={handleMarkNotSpam}
        />

        <Dialog 
          open={quickReplyManagerOpen} 
          onOpenChange={(open) => setQuickReplyManagerOpen(open)}
        >
          <DialogContent className="sm:max-w-[700px]">
            <QuickReplyManager />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Chat;
