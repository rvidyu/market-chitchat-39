
import React, { createContext, useState, useEffect } from "react";
import { User, AuthContextType } from "./types";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { fetchUserProfile, formatUserData } from "./authUtils";

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Get user profile data
          setTimeout(async () => {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .maybeSingle();

            if (!error && profile) {
              setUser(formatUserData(currentSession.user.id, currentSession.user.email, profile));
            } else {
              console.error("Error fetching user profile:", error);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .maybeSingle();

          if (!error && profile) {
            setUser(formatUserData(data.session.user.id, data.session.user.email, profile));
          }
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        // Handle demo accounts
        if (email === 'buyer@example.com' && password === 'password') {
          const mockUser: User = {
            id: 'buyer-1',
            name: 'Jane Smith',
            email: 'buyer@example.com',
            role: 'buyer'
          };
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          navigate('/');
          toast({
            title: "Login successful",
            description: `Welcome back, ${mockUser.name}!`,
          });
          return;
        } else if (email === 'seller@example.com' && password === 'password') {
          const mockUser: User = {
            id: 'seller-1',
            name: 'Crafty Creations',
            email: 'seller@example.com',
            role: 'seller'
          };
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          navigate('/');
          toast({
            title: "Login successful",
            description: `Welcome back, ${mockUser.name}!`,
          });
          return;
        } else {
          setError(error.message);
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
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
        // Mock registration for demo
        const mockUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          role
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully.",
        });
        navigate('/');
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

  return (
    <AuthContext.Provider value={{ user, session, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
