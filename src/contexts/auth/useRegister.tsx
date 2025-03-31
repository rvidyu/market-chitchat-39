
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { NavigateFunction } from "react-router-dom";

interface UseRegisterProps {
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  toast: any;
  navigate: NavigateFunction;
}

export const useRegister = ({ setUser, setError, setLoading, toast, navigate }: UseRegisterProps) => {
  // Register function
  const register = async (name: string, email: string, password: string, role: "buyer" | "seller" = "buyer") => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data?.user) {
        // This is handled by the onAuthStateChange listener,
        // but we could add additional logic here if needed
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully.",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
      toast({
        title: "Registration failed",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { register };
};
