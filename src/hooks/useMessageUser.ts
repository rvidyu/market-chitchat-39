
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageUserData {
  isCurrentUser: boolean;
  senderName: string;
}

// Cache for user profiles to reduce redundant database queries
const userProfileCache: Record<string, { name: string; timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes cache expiry

/**
 * Custom hook to fetch and determine message user information
 * With enhanced caching to improve performance
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
        
        // Check cache first
        const now = Date.now();
        const cachedProfile = userProfileCache[senderId];
        
        if (cachedProfile && (now - cachedProfile.timestamp) < CACHE_EXPIRY) {
          // Use cached data if available and not expired
          console.log("Using cached profile data for:", senderId);
          setUserData({
            isCurrentUser,
            senderName: isCurrentUser ? "You" : cachedProfile.name
          });
          setIsLoading(false);
          return;
        }
        
        // Fetch sender profile from database if not in cache or expired
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
          // Update cache with new data
          userProfileCache[senderId] = {
            name: profile.name,
            timestamp: now
          };
          
          // If it's the current user, show "You", otherwise show their name
          setUserData({
            isCurrentUser,
            senderName: isCurrentUser ? "You" : profile.name
          });
        } else {
          // Fallback for when profile doesn't exist or name is null
          const fallbackName = `User ${senderId.substring(0, 7)}`;
          
          // Cache the fallback name too to prevent repeated lookups
          userProfileCache[senderId] = {
            name: fallbackName,
            timestamp: now
          };
          
          setUserData({
            isCurrentUser,
            senderName: isCurrentUser ? "You" : fallbackName
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
