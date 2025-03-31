
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { MessageSquare, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Product } from "@/data/products";
import { SellerData } from "@/data/sellers";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ContactSellerButtonProps {
  product: Product;
  seller: SellerData;
  variant?: "inline" | "button";
}

interface ContactFormValues {
  message: string;
}

const ContactSellerButton = ({ product, seller, variant = "button" }: ContactSellerButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const form = useForm<ContactFormValues>({
    defaultValues: {
      message: `Hi! I'm interested in your product "${product.name}". Is it still available?`,
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to contact sellers",
        variant: "destructive"
      });
      setOpen(false);
      navigate("/login");
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate conversation ID (sort IDs to ensure consistency)
      const participantIds = [user.id, seller.id].sort();
      const conversationId = participantIds.join('-');
      
      // Create a new message in the database
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: seller.id,
        text: data.message,
        product_id: product.id,
        product_name: product.name,
        product_image: product.imageUrl,
        product_price: `$${product.price.toFixed(2)}`,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        throw error;
      }
      
      // Also update conversations table to ensure the conversation appears
      await supabase.from('conversations').upsert({
        sender_id: user.id,
        recipient_id: seller.id,
        text: data.message,
        timestamp: new Date().toISOString(),
        is_read: false,
        conversation_id: conversationId
      }, { onConflict: 'conversation_id' });
      
      // Invalidate conversations query to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Navigate to chat with the conversation already selected
      navigate(`/chat`, { 
        state: { 
          conversationId: conversationId
        } 
      });
      
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
      form.reset();
    }
  };

  const handleClick = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to contact sellers",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    setOpen(true);
  };

  if (variant === "inline") {
    return (
      <Button 
        onClick={handleClick}
        variant="secondary"
        className="w-full"
      >
        <MessageSquare className="mr-2 h-4 w-4" /> 
        Contact Seller
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-messaging-primary text-messaging-primary hover:bg-messaging-primary/10"
          onClick={handleClick}
        >
          <MessageSquare className="mr-2 h-4 w-4" /> Contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact about {product.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md mb-4">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="h-16 w-16 object-cover rounded-md"
          />
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Seller: {seller.name}</div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your message here..." 
                      className="min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-messaging-primary hover:bg-messaging-accent"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSellerButton;
