
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/data/products";
import { SellerData } from "@/data/sellers";
import { sendMessage } from "@/data/messageApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MessageStarterProps {
  product: Product;
  seller: SellerData;
  variant?: "inline" | "button";
}

interface MessageFormValues {
  message: string;
}

const ProductMessageStarter = ({ product, seller, variant = "button" }: MessageStarterProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<MessageFormValues>({
    defaultValues: {
      message: `Hi! I'm interested in your product "${product.name}". Is it still available?`,
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // Convert product to format expected by sendMessage
      const productData = {
        id: product.id,
        name: product.name,
        image: product.imageUrl,
        price: `$${product.price.toFixed(2)}`
      };
      
      return sendMessage(seller.id, message, productData);
    },
    onSuccess: (data) => {
      // Invalidate conversations query to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Show success toast
      toast({
        title: "Message sent",
        description: `Your message about "${product.name}" has been sent to ${seller.name}.`,
      });
      
      // Construct conversation ID from user and seller IDs (sorted)
      const userIds = [user?.id, seller.id].sort();
      const conversationId = userIds.join('-');
      
      // Close dialog and navigate to chat
      setOpen(false);
      form.reset();
      
      // Navigate to chat page, passing the conversation ID
      navigate(`/chat`, { 
        state: { 
          conversationId
        } 
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message || "There was an error sending your message.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: MessageFormValues) => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    sendMessageMutation.mutate(data.message);
  };
  
  const handleQuickMessage = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Use the default message from the form
    sendMessageMutation.mutate(form.getValues().message);
  };

  if (variant === "inline") {
    return (
      <div className="mt-2">
        <Button 
          onClick={handleQuickMessage}
          variant="secondary"
          className="w-full"
        >
          <MessageSquare className="mr-2 h-4 w-4" /> 
          Quick Message About This Item
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-messaging-primary hover:bg-messaging-accent"
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              navigate("/login");
            }
          }}
        >
          <MessageSquare className="mr-2 h-4 w-4" /> Message Seller
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message about {product.name}</DialogTitle>
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
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-messaging-primary hover:bg-messaging-accent">
                <MessageSquare className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductMessageStarter;
