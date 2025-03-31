
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageUserData {
  isCurrentUser: boolean;
  senderName: string;
}

// Global cache for user profiles to reduce redundant database queries
const userProfileCache: Record<string, { name: string; timestamp: number }> = {};
// Increase cache expiry to 2 hours for better performance
const CACHE_EXPIRY = 2 * 60 * 60 * 1000; // 2 hour cache expiry

export const useMessageUser = (senderId: string) => {
  const [userData, setUserData] = useState<MessageUserData>({
    isCurrentUser: false,
    senderName: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip fetching for empty sender IDs
    if (!senderId) {
      setIsLoading(false);
      return;
    }
    
    let isMounted = true;
    
    // Use an immediately invoked async function for cleaner code
    (async () => {
      try {
        setIsLoading(true);
        
        // Get current user from sessionStorage for performance
        const sessionUser = sessionStorage.getItem('currentUser');
        let user = sessionUser ? JSON.parse(sessionUser) : null;
        
        if (!user) {
          // If not in session storage, get from supabase and store for future use
          const { data } = await supabase.auth.getUser();
          user = data.user;
          if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
          }
        }
        
        // Determine if message is from current user
        const isCurrentUser = user ? senderId === user.id : false;
        
        // Use a shorter display name for the current user
        if (isCurrentUser && isMounted) {
          setUserData({
            isCurrentUser: true,
            senderName: "You"
          });
          setIsLoading(false);
          return;
        }
        
        // Check cache first - this avoids unnecessary database queries
        const now = Date.now();
        const cachedProfile = userProfileCache[senderId];
        
        if (cachedProfile && (now - cachedProfile.timestamp) < CACHE_EXPIRY) {
          // Use cached data if available and not expired
          if (isMounted) {
            setUserData({
              isCurrentUser,
              senderName: cachedProfile.name || `User-${senderId.substring(0, 5)}`
            });
            setIsLoading(false);
          }
          return;
        }
        
        // Use batch query to get profiles more efficiently
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', senderId)
          .maybeSingle();
        
        if (!isMounted) return;
        
        // Update name based on profile data
        const displayName = profile?.name || `User-${senderId.substring(0, 5)}`;
        
        // Update cache regardless of whether profile was found
        userProfileCache[senderId] = {
          name: displayName,
          timestamp: now
        };
        
        setUserData({
          isCurrentUser,
          senderName: displayName
        });
      } catch (error) {
        console.error("Error in useMessageUser:", error);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error(String(error)));
          setUserData({
            isCurrentUser: false,
            senderName: `User-${senderId.substring(0, 5)}`
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    
    // Clean up function to prevent state updates if component unmounts during fetch
    return () => {
      isMounted = false;
    };
  }, [senderId]);

  return { ...userData, isLoading, error };
};
