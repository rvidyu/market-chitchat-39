
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface UseProfileUpdateProps {
  userId: string | undefined;
  session: Session | null;
}

export const useProfileUpdate = ({ userId, session }: UseProfileUpdateProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateProfile = async () => {
    if (!userId || !session) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to update your profile",
      });
      return { error: new Error("Authentication error") };
    }
    
    console.log("Updating profile with name:", name);
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        name,
        email,
        shop_description: bio 
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Profile update error:", updateError);
      return { error: updateError };
    }
    
    return { success: true };
  };

  return {
    name,
    setName,
    email,
    setEmail,
    bio,
    setBio,
    isLoading,
    setIsLoading,
    updateProfile
  };
};
