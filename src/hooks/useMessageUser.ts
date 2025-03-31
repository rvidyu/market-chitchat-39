
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageUserData {
  isCurrentUser: boolean;
  senderName: string;
}

/**
 * Custom hook to fetch and determine message user information
 */
export const useMessageUser = (senderId: string) => {
  const [userData, setUserData] = useState<MessageUserData>({
    isCurrentUser: false,
    senderName: "User",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Determine if message is from current user
        const isCurrentUser = user ? senderId === user.id : false;
        
        // Fetch sender profile from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', senderId)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setUserData({
            isCurrentUser,
            senderName: isCurrentUser ? "You" : `User ${senderId.substring(0, 7)}`
          });
        } else if (profile && profile.name) {
          // If it's the current user, show "You", otherwise show their full name
          setUserData({
            isCurrentUser,
            senderName: isCurrentUser ? "You" : profile.name
          });
        } else {
          // Fallback for when profile doesn't exist or name is null
          setUserData({
            isCurrentUser,
            senderName: isCurrentUser ? "You" : `User ${senderId.substring(0, 7)}`
          });
        }
      } catch (error) {
        console.error("Error in useMessageUser:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
        setUserData({
          isCurrentUser: false,
          senderName: "User"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [senderId]);

  return { ...userData, isLoading, error };
};
