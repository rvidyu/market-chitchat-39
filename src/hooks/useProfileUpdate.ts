
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateProfileName = async () => {
    if (!userId || !session) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to update your profile",
      });
      return { error: new Error("Authentication error") };
    }
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', userId);
    
    if (updateError) {
      return { error: updateError };
    }
    
    return { success: true };
  };

  return {
    name,
    setName,
    isLoading,
    setIsLoading,
    updateProfileName
  };
};
