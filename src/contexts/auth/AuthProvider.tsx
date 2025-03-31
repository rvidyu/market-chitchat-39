
import React, { useState, useEffect } from "react";
import { User, AuthContextType } from "./types";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AuthContext } from "./AuthContext";
import { useLogin } from "./useLogin";
import { useRegister } from "./useRegister";
import { useLogout } from "./useLogout";
import { fetchUserProfile, formatUserData } from "./authUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get login, register, and logout functions from custom hooks
  const { login } = useLogin({ setUser, setError, setLoading, toast, navigate });
  const { register } = useRegister({ setUser, setError, setLoading, toast, navigate });
  const { logout } = useLogout({ setUser, setLoading, toast, navigate });

  // Set up auth state listener
  useEffect(() => {
    // Configure Supabase client for better auth handling
    supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event);
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Get user profile data
        setTimeout(async () => {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .maybeSingle();

            if (!error && profile) {
              setUser(formatUserData(currentSession.user.id, currentSession.user.email, profile));
            } else {
              console.error("Error fetching user profile:", error);
              setError(error?.message || "Failed to fetch user profile");
            }
          } catch (err) {
            console.error("Error in profile fetch:", err);
          }
        }, 0);
      } else {
        setUser(null);
      }
    });

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session?.user) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .maybeSingle();

            if (!error && profile) {
              setUser(formatUserData(data.session.user.id, data.session.user.email, profile));
            } else {
              console.error("Error fetching user profile:", error);
            }
          } catch (err) {
            console.error("Error in initial profile fetch:", err);
          }
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up real-time subscriptions for user profile changes
    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' }, 
          async (payload) => {
            console.log('Profile change detected:', payload);
            // If the current user's profile changed, update the user state
            if (session?.user && payload.new && typeof payload.new === 'object' && 'id' in payload.new && payload.new.id === session.user.id) {
              const updatedProfile = payload.new;
              setUser(formatUserData(session.user.id, session.user.email, updatedProfile));
            }
          })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
