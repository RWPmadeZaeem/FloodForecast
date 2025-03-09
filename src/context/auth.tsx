"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Session, SignUpWithPasswordCredentials, SignInWithPasswordCredentials, User } from "@supabase/supabase-js";

// Define the types for our context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: { email: string; password: string; options?: any }) => Promise<any>;
  signIn: (data: { email: string; password: string }) => Promise<any>;
  signOut: () => Promise<any>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    };
    
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Auth functions
  const value = {
    user,
    session,
    loading,
    signUp: (data: SignUpWithPasswordCredentials) => supabase.auth.signUp(data),
    signIn: (data: SignInWithPasswordCredentials) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};