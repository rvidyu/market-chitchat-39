
import { createContext } from "react";
import { AuthContextType } from "./types";

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
