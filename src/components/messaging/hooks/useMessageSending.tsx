
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { sendMessage } from "@/data/api";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const useMessageSending = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle sending a new message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, text, images }: { 
      recipientId: string; 
      text: string; 
      images?: File[];
    }) => {
      // Handle image uploads to Supabase Storage
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        try {
          // Get the current user session
          const { data } = await supabase.auth.getSession();
          const userId = data.session?.user.id;
          
          if (!userId) {
            throw new Error("User not authenticated");
          }
          
          // Process each image
          for (const image of images) {
            // Generate a unique ID for the image
            const uniqueId = uuidv4();
            const filePath = `${userId}/${uniqueId}-${image.name.replace(/\s+/g, '_')}`;
            
            // Upload to 'message-images' bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('message-images')
              .upload(filePath, image, {
                cacheControl: '3600',
                upsert: false
              });
              
            if (uploadError) {
              console.error("Error uploading image:", uploadError);
              throw new Error(uploadError.message);
            }
            
            // Get the public URL
            const { data: publicUrlData } = supabase.storage
              .from('message-images')
              .getPublicUrl(filePath);
              
            if (publicUrlData?.publicUrl) {
              imageUrls.push(publicUrlData.publicUrl);
            }
          }
        } catch (error) {
          console.error("Error processing images:", error);
          toast({
            title: "Image upload failed",
            description: error instanceof Error ? error.message : "Failed to upload one or more images",
            variant: "destructive",
          });
        }
      }

      console.log("Sending message to recipient:", recipientId);
      console.log("Message text:", text);
      console.log("Image URLs:", imageUrls);

      // Send the message with image URLs
      return sendMessage(
        recipientId, 
        text, 
        undefined, 
        imageUrls.length > 0 ? imageUrls : undefined
      );
    },
    onSuccess: () => {
      // Invalidate conversations query to refresh data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error("Error in sendMessageMutation:", error);
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "There was an error sending your message.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = async (
    activeConversationId: string | null,
    conversationsList: any[],
    text: string, 
    images?: File[]
  ) => {
    if (!activeConversationId) {
      console.error("No active conversation ID provided");
      return;
    }

    // Find the active conversation
    const activeConversation = conversationsList.find(
      (conversation) => conversation.id === activeConversationId
    );

    if (!activeConversation) {
      console.error("Active conversation not found in list:", activeConversationId);
      console.log("Available conversations:", conversationsList.map(c => c.id));
      return;
    }

    try {
      // Get the current user session
      const { data } = await supabase.auth.getSession();
      const currentUserId = data.session?.user.id || "";
      
      if (!currentUserId) {
        console.error("No current user ID found");
        toast({
          title: "Authentication error",
          description: "You must be logged in to send messages",
          variant: "destructive",
        });
        return;
      }
      
      // Find the recipient
      const recipient = activeConversation.participants.find(
        (participant) => participant.id !== currentUserId
      );
  
      if (!recipient) {
        console.error("No recipient found in conversation. Participants:", activeConversation.participants);
        console.error("Current user ID:", currentUserId);
        toast({
          title: "Error sending message",
          description: "Recipient not found. Please refresh the page and try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Sending message to recipient:", recipient.id, "from user:", currentUserId);
  
      // Send the message
      sendMessageMutation.mutate({ 
        recipientId: recipient.id, 
        text, 
        images 
      });
    } catch (error) {
      console.error("Error in message sending process:", error);
      toast({
        title: "Error sending message",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    handleSendMessage,
    isSending: sendMessageMutation.isPending
  };
};
