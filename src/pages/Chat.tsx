
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Messaging from "@/components/messaging/Messaging";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Store, MessageSquare } from "lucide-react";

const Chat = () => {
  const { user } = useAuth();
  const { sellerId, productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Extract data passed from product message starter
  useEffect(() => {
    // If conversation ID is in the URL state, set it as active
    if (location.state?.conversationId) {
      setActiveConversationId(location.state.conversationId);
    }

    // If coming from a product page with product info, we could start a new conversation
    // or find an existing one about that product
    if (sellerId && productId) {
      console.log("Opening chat with seller:", sellerId, "about product:", productId);
      // In a real app, we would look up or create a conversation here
      // For now, we'll just log it
    }
  }, [location.state, sellerId, productId]);

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
        <h1 className="text-2xl font-bold mb-6 flex items-center text-messaging-primary">
          <MessageSquare className="mr-2 h-6 w-6" /> Messages
        </h1>
        
        <Messaging initialConversationId={activeConversationId} />
      </main>
    </div>
  );
};

export default Chat;
