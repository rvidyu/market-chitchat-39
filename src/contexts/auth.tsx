
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: "buyer" | "seller") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Check for buyer@example.com / password
      if (email === "buyer@example.com" && password === "password") {
        const buyerUser: User = {
          id: "buyer-1",
          name: "Demo Buyer",
          email: "buyer@example.com",
          role: "buyer"
        };
        
        localStorage.setItem("user", JSON.stringify(buyerUser));
        setUser(buyerUser);
        toast({
          title: "Login successful",
          description: "Welcome back, Demo Buyer!",
        });
        navigate("/");
        return;
      }
      
      // Check for seller@example.com / password
      if (email === "seller@example.com" && password === "password") {
        const sellerUser: User = {
          id: "seller-1",
          name: "Demo Seller",
          email: "seller@example.com",
          role: "seller"
        };
        
        localStorage.setItem("user", JSON.stringify(sellerUser));
        setUser(sellerUser);
        toast({
          title: "Login successful",
          description: "Welcome back, Demo Seller!",
        });
        navigate("/");
        return;
      }
      
      // If we get here, credentials are invalid
      throw new Error("Invalid email or password");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login.",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: "buyer" | "seller") => {
    setLoading(true);
    
    try {
      // Create a new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role
      };
      
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
      
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
