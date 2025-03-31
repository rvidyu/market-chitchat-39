
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageUserData {
  isCurrentUser: boolean;
  senderName: string;
}

// Global cache for user profiles to reduce redundant database queries
const userProfileCache: Record<string, { name: string; timestamp: number }> = {};
// Increase cache expiry to 1 hour for better performance
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour cache expiry (changed from 30 minutes)

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
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user from sessionStorage first if available
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
        
        // Fetch sender profile from database if not in cache or expired
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', senderId)
          .maybeSingle();
        
        if (!isMounted) return;
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          const fallbackName = `User-${senderId.substring(0, 5)}`;
          userProfileCache[senderId] = {
            name: fallbackName,
            timestamp: now
          };
          setUserData({
            isCurrentUser,
            senderName: fallbackName
          });
        } else if (profile && profile.name) {
          // Update cache with new data
          userProfileCache[senderId] = {
            name: profile.name,
            timestamp: now
          };
          
          setUserData({
            isCurrentUser,
            senderName: profile.name
          });
        } else {
          // Fallback for when profile doesn't exist or name is null
          const fallbackName = `User-${senderId.substring(0, 5)}`;
          
          // Cache the fallback name too to prevent repeated lookups
          userProfileCache[senderId] = {
            name: fallbackName,
            timestamp: now
          };
          
          setUserData({
            isCurrentUser,
            senderName: fallbackName
          });
        }
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
    };
    
    fetchUserData();
    
    // Clean up function to prevent state updates if component unmounts during fetch
    return () => {
      isMounted = false;
    };
  }, [senderId]);

  return { ...userData, isLoading, error };
};
