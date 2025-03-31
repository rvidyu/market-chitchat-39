
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, usingMockSupabase } from '@/integrations/supabase/client';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getMockUser(role: 'buyer' | 'seller'): User {
  return {
    id: role === 'buyer' ? 'buyer-1' : 'seller-1',
    name: role === 'buyer' ? 'Jane Smith' : 'Crafty Creations',
    email: role === 'buyer' ? 'jane@example.com' : 'crafty@example.com',
    role: role
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        
        if (usingMockSupabase) {
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
          setLoading(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData && !userError) {
            setUser({
              id: userData.id,
              name: userData.name || '',
              email: userData.email || '',
              role: userData.role as 'buyer' | 'seller' || 'buyer'
            });
          } else if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } else if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (user) {
        navigate('/');
        return;
      }

      if (usingMockSupabase) {
        if (email === 'buyer@example.com' && password === 'password') {
          const mockUser = getMockUser('buyer');
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          navigate('/');
          return;
        } else if (email === 'seller@example.com' && password === 'password') {
          const mockUser = getMockUser('seller');
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          navigate('/');
          return;
        } else {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Supabase auth error:", error);
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
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userData && !userError) {
          const authUser: User = {
            id: userData.id,
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role as 'buyer' | 'seller' || 'buyer'
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

  const register = async (name: string, email: string, password: string, role: 'buyer' | 'seller') => {
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
        const { error: profileError } = await supabase
          .from('profiles')
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
    
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
