"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";

interface User {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  role?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  portfolio?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiFetch("/api/users/me");
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
