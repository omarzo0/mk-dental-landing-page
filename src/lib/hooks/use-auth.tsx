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
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "mk-dental-auth";
const TOKEN_STORAGE_KEY = "mk-dental-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      }
      if (storedToken) {
        setToken(storedToken);
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

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        // Try admin login first
        const adminResponse = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const adminData = await adminResponse.json() as {
          success?: boolean;
          data?: {
            admin?: {
              _id?: string;
              id?: string;
              email?: string;
              username?: string;
              profile?: { firstName?: string; lastName?: string; avatar?: string };
            };
            token?: string;
          };
          error?: string;
          message?: string;
        };

        if (adminData.success) {
          console.log("[useAuth] Admin login reported success", adminData);

          // The backend usually nests data like { success: true, data: { admin: {...}, token: "..." } }
          // but sometimes it might be different. Let's be flexible.
          const payload = adminData.data || (adminData as any);
          const adminUser = payload.admin || payload.user;
          const authToken = payload.token;

          if (adminUser) {
            console.log("[useAuth] Successfully extracted admin user info");
            const user: User = {
              id: adminUser?._id || adminUser?.id || "",
              email: adminUser?.email || "",
              name: adminUser?.profile?.firstName
                ? `${adminUser.profile.firstName} ${adminUser.profile.lastName || ""}`.trim()
                : adminUser?.username || adminUser?.name || "Admin",
              role: "admin",
              avatar: adminUser?.profile?.avatar,
            };

            setUser(user);
            setToken(authToken || null);

            // Persist immediately as a backup
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
            if (authToken) localStorage.setItem(TOKEN_STORAGE_KEY, authToken);

            return { success: true };
          } else {
            console.warn("[useAuth] Admin login success but no user data found in:", adminData);
            // If data is missing but success is true, we might still want to try user login
            // but let's see if we should just stop here.
          }
        }

        // If admin login fails, try user login
        const userResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const userData = await userResponse.json() as {
          success?: boolean;
          data?: {
            user?: {
              _id?: string;
              id?: string;
              email?: string;
              username?: string;
              profile?: { firstName?: string; lastName?: string; avatar?: string };
            };
            token?: string;
            tokens?: { accessToken?: string };
          };
          error?: string;
          message?: string;
        };

        if (userData.success && userData.data) {
          const userInfo = userData.data.user;
          const authToken = userData.data.token || userData.data.tokens?.accessToken;

          const user: User = {
            id: userInfo?._id || userInfo?.id || "",
            email: userInfo?.email || "",
            name: userInfo?.profile?.firstName
              ? `${userInfo.profile.firstName} ${userInfo.profile.lastName || ""}`.trim()
              : userInfo?.username || "User",
            role: "user",
            avatar: userInfo?.profile?.avatar,
          };

          setUser(user);
          setToken(authToken || null);
          return { success: true };
        }

        // Both logins failed
        return {
          success: false,
          error: adminData.error || adminData.message || userData.error || userData.message || "Invalid email or password"
        };
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Failed to connect to server" };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    router.push("/");
  }, [router]);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            username: email.split("@")[0],
            profile: {
              firstName: name.split(" ")[0] || name,
              lastName: name.split(" ").slice(1).join(" ") || "",
            },
          }),
        });

        const data = await response.json() as {
          success?: boolean;
          data?: {
            user?: {
              _id?: string;
              id?: string;
              email?: string;
              username?: string;
              profile?: { firstName?: string; lastName?: string; avatar?: string };
            };
            token?: string;
            tokens?: { accessToken?: string };
          };
          error?: string;
          message?: string;
        };

        if (data.success && data.data) {
          const userInfo = data.data.user;
          const authToken = data.data.token || data.data.tokens?.accessToken;

          const newUser: User = {
            id: userInfo?._id || userInfo?.id || "",
            email: userInfo?.email || "",
            name: userInfo?.profile?.firstName
              ? `${userInfo.profile.firstName} ${userInfo.profile.lastName || ""}`.trim()
              : userInfo?.username || "User",
            role: "user",
            avatar: userInfo?.profile?.avatar,
          };

          setUser(newUser);
          setToken(authToken || null);
          return { success: true };
        }

        return {
          success: false,
          error: data.error || data.message || "Registration failed"
        };
      } catch (error) {
        console.error("Signup error:", error);
        return { success: false, error: "Failed to connect to server" };
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      logout,
      signup,
    }),
    [user, token, isLoading, login, logout, signup]
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
