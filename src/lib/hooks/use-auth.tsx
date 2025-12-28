"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin credentials - in production, this would be a database call
const MOCK_USERS: Array<{ email: string; password: string; user: User }> = [
  {
    email: "admin@mkdental.com",
    password: "admin123",
    user: {
      id: "1",
      email: "admin@mkdental.com",
      name: "Admin User",
      role: "admin",
    },
  },
  {
    email: "user@test.com",
    password: "user123",
    user: {
      id: "2",
      email: "user@test.com",
      name: "Test User",
      role: "user",
    },
  },
];

const AUTH_STORAGE_KEY = "mk-dental-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const foundUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        setUser(foundUser.user);
        return { success: true };
      }

      return { success: false, error: "Invalid email or password" };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    router.push("/");
  }, [router]);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string
    ): Promise<{ success: boolean; error?: string }> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        return { success: false, error: "Email already registered" };
      }

      // Create new user (in production, this would be saved to database)
      const newUser: User = {
        id: String(Date.now()),
        email,
        name,
        role: "user",
      };

      // Add to mock users (this won't persist after refresh in this mock setup)
      MOCK_USERS.push({ email, password, user: newUser });

      setUser(newUser);
      return { success: true };
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      logout,
      signup,
    }),
    [user, isLoading, login, logout, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
