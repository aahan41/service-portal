import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

type UserRole = "admin" | "user";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  exp: number;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUser(null);
        return;
      }
      
      const payload = JSON.parse(atob(token.split(".")[1]));
      
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("auth_token");
        setUser(null);
        return;
      }
      
      setUser({
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        exp: payload.exp
      });
    } catch (e) {
      setUser(null);
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [checkAuth]);

  const login = (token: string) => {
    localStorage.setItem("auth_token", token);
    checkAuth();
    
    // Check where to route
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setLocation("/");
  };

  return { user, isLoading, login, logout, checkAuth };
}
