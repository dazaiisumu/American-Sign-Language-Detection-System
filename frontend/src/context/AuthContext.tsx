"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { loginUser, signupUser, getCurrentUser, type AuthResponse } from "@/api/authApi";

interface User {
  id: number; // ✅ Updated from string to number
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response: AuthResponse = await getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data as User);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response: AuthResponse = await loginUser({ email, password });
      if (response.success && response.data) {
        setUser(response.data as User); // ✅ id is now a number
        return { success: true };
      }
      return { success: false, error: response.error || "Invalid credentials" };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
      setLoading(false);
    }
  };

  // Signup function (DO NOT auto-login)
  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response: AuthResponse = await signupUser({ email, password, name });
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.error || "Signup failed" };
    } catch (error) {
      console.error("Signup failed:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      login,
      signup,
      logout,
      loading,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
