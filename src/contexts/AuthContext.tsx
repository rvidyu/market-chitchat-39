
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
}

// Define context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// Mock user database (in a real app, this would be a backend service)
const MOCK_USERS: Record<string, User & { password: string }> = {
  "user-1": {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Find user by email
    const foundUser = Object.values(MOCK_USERS).find(
      (user) => user.email === email && user.password === password
    );
    
    if (foundUser) {
      // Remove password before storing user data
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      toast({
        title: "Login successful",
        description: `Welcome back, ${foundUser.name}!`,
      });
      navigate("/");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Check if email already exists
    const emailExists = Object.values(MOCK_USERS).some(
      (user) => user.email === email
    );
    
    if (emailExists) {
      toast({
        title: "Registration failed",
        description: "Email is already in use",
        variant: "destructive",
      });
    } else {
      // Create new user
      const newUserId = `user-${Date.now()}`;
      const newUser = {
        id: newUserId,
        name,
        email,
        password,
      };
      
      // In a real app, this would be saved to a database
      MOCK_USERS[newUserId] = newUser;
      
      // Login the user after registration
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      
      navigate("/");
    }
    
    setLoading(false);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
