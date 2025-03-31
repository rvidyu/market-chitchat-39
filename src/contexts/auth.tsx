
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller') => Promise<void>;
  logout: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data (only for demo purposes)
export function getMockUser(role: 'buyer' | 'seller'): User {
  return {
    id: role === 'buyer' ? 'buyer-1' : 'seller-1',
    name: role === 'buyer' ? 'Jane Smith' : 'Crafty Creations',
    email: role === 'buyer' ? 'jane@example.com' : 'crafty@example.com',
    role: role
  };
}

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Try to get session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // User is logged in with Supabase
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData && !userError) {
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role
            });
          } else {
            // Fallback to local storage if Supabase fails
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
          }
        } else {
          // Check local storage as fallback
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // Fallback to local storage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, check if we already have a user logged in
      if (user) {
        // User is already logged in, redirect to home
        navigate('/');
        return;
      }

      // Try with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Fallback to mock login for demo
        if (email === 'buyer@example.com' && password === 'password') {
          const mockUser = getMockUser('buyer');
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          navigate('/');
        } else if (email === 'seller@example.com' && password === 'password') {
          const mockUser = getMockUser('seller');
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          navigate('/');
        } else {
          setError('Invalid email or password');
        }
        return;
      }

      if (data.user) {
        // Get user data from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userData && !userError) {
          const authUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          };
          setUser(authUser);
          localStorage.setItem('user', JSON.stringify(authUser));
          navigate('/');
        } else {
          setError('User data not found');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: 'buyer' | 'seller') => {
    setLoading(true);
    setError(null);
    
    try {
      // Try with Supabase
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
        // Fallback to mock registration for demo
        const mockUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          role
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        navigate('/');
        return;
      }

      if (data.user) {
        // Create user profile in Supabase
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name,
            email,
            role
          });

        if (profileError) {
          setError('Failed to create user profile');
          return;
        }

        const authUser: User = {
          id: data.user.id,
          name,
          email,
          role
        };
        
        setUser(authUser);
        localStorage.setItem('user', JSON.stringify(authUser));
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Log out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
    
    // Always clear local state regardless of Supabase
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
