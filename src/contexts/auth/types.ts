
import { Session } from "@supabase/supabase-js";

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
  role?: "buyer" | "seller";
}

// Define context type
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: "buyer" | "seller") => Promise<void>;
  logout: () => Promise<void>;
}
