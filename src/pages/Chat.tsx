import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Messaging from "@/components/messaging/Messaging";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import QuickReplyManager from "@/components/messaging/QuickReplyManager";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const Chat = () => {
  const { user } = useAuth();
  const { sellerId, productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [quickReplyManagerOpen, setQuickReplyManagerOpen] = useState(false);

  useEffect(() => {
    // Handle conversation ID from URL params or location state
    const initChat = async () => {
      if (!user) return;
      
      // First check if there's a conversationId in the location state
      const conversationIdFromState = location.state?.conversationId;
      if (conversationIdFromState) {
        console.log("Found conversation ID in state:", conversationIdFromState);
        setActiveConversationId(conversationIdFromState);
        
        // Force refresh conversations data
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        return;
      }
      
      // Check if seller ID is in state (used by ShopOverview)
      const sellerIdFromState = location.state?.sellerId;
      const sellerIdToUse = sellerId || sellerIdFromState;
      
      if (sellerIdToUse && user) {
        // Generate conversation ID (sort IDs to ensure consistency)
        const participantIds = [user.id, sellerIdToUse].sort();
        const conversationId = participantIds.join('-');
        console.log("Generated conversation ID:", conversationId);
        setActiveConversationId(conversationId);
        
        // If we also have a product ID, we should start the conversation with that product
        if (productId) {
          try {
            // Fetch product details
            const { data: productData, error: productError } = await supabase
              .from('products')
              .select('*')
              .eq('id', productId)
              .single();
              
            if (productError || !productData) {
              console.error('Error fetching product:', productError);
              return;
            }
            
            // Check if there are any existing messages in this conversation
            const { data: existingMessages, error: messagesError } = await supabase
              .from('messages')
              .select('count')
              .or(`and(sender_id.eq.${user.id},recipient_id.eq.${sellerIdToUse}),and(sender_id.eq.${sellerIdToUse},recipient_id.eq.${user.id})`)
              .limit(1);
              
            if (messagesError) {
              console.error('Error checking existing messages:', messagesError);
              return;
            }
            
            // Only add the product message if this is a new conversation
            if (!existingMessages || existingMessages.length === 0) {
              // Create a new message including the product
              const { error: sendError } = await supabase
                .from('messages')
                .insert({
                  sender_id: user.id,
                  recipient_id: sellerIdToUse,
                  text: `Hi, I'm interested in this product:`,
                  product_id: productData.id,
                  product_name: productData.name,
                  product_price: `$${productData.price}`,
                  product_image: productData.image_url,
                  timestamp: new Date().toISOString()
                });
                
              if (sendError) {
                console.error('Error sending product message:', sendError);
              } else {
                // Also update conversations table to ensure the conversation appears
                await supabase.from('conversations').upsert({
                  sender_id: user.id,
                  recipient_id: sellerIdToUse,
                  text: `Hi, I'm interested in this product:`,
                  timestamp: new Date().toISOString(),
                  is_read: false,
                  conversation_id: conversationId
                }, { onConflict: 'conversation_id' });
                
                // Force refresh conversations data
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
              }
            }
          } catch (err) {
            console.error('Error initializing product chat:', err);
          }
        }
      }
    };
    
    initChat();
  }, [location.state, sellerId, productId, user, navigate, queryClient]);

  const handleMarkNotSpam = () => {
    toast({
      title: "Marked as not spam",
      description: "The conversation has been moved back to your inbox.",
      variant: "default",
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
