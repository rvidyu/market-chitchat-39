
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

interface UseLogoutProps {
  setUser: (user: null) => void;
  setLoading: (loading: boolean) => void;
  toast: any;
  navigate: NavigateFunction;
}

export const useLogout = ({ setUser, setLoading, toast, navigate }: UseLogoutProps) => {
  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { logout };
};
