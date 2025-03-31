
// This file serves as a compatibility layer to redirect to the new auth system
// Import from the new auth folder structure
import { AuthContext } from './auth/AuthContext';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';

// Re-export everything from the new auth context
export { AuthContext, AuthProvider, useAuth };
