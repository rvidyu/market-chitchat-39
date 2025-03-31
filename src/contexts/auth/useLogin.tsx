
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { NavigateFunction } from "react-router-dom";

interface UseLoginProps {
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  toast: any;
  navigate: NavigateFunction;
}

export const useLogin = ({ setUser, setError, setLoading, toast, navigate }: UseLoginProps) => {
  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile && !profileError) {
          const authUser: User = {
            id: data.user.id,
            name: profile.name || '',
            email: profile.email || data.user.email || '',
            role: profile.role as "buyer" | "seller" || "buyer"
          };
          setUser(authUser);
          toast({
            title: "Login successful",
            description: `Welcome back, ${authUser.name}!`,
          });
          navigate("/");
        } else {
          setError('Failed to fetch user profile');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      toast({
        title: "Login failed",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { login };
};
