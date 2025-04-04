
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";

// Mock user data function for fallback
export const getMockUser = (role: 'buyer' | 'seller'): User => {
  return {
    id: role === 'buyer' ? 'buyer-1' : 'seller-1',
    name: role === 'buyer' ? 'Jane Smith' : 'Crafty Creations',
    email: role === 'buyer' ? 'jane@example.com' : 'crafty@example.com',
    role: role
  };
};

// Fetch user profile from the database
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !profile) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return {
    id: userId,
    email: profile.email || '',
    name: profile.name || '',
    role: profile.role as "buyer" | "seller" || "buyer"
  };
};

// Format user data from profile and session
export const formatUserData = (
  userId: string, 
  email: string | undefined, 
  profile: any
): User => {
  return {
    id: userId,
    email: email || '',
    name: profile?.name || email?.split('@')[0] || '',
    role: profile?.role as "buyer" | "seller" || "buyer"
  };
};
