// lib/auth-context.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  email: string;
  name: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user && pathname !== "/login" && pathname !== "/") {
      router.push("/login");
    }
  }, [user, pathname, router]);

  const login = (email: string) => {
    const mockUser: User = {
      email,
      name: email
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
    };
    setUser(mockUser);
    localStorage.setItem("auth_user", JSON.stringify(mockUser));
    router.push("/projects");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
