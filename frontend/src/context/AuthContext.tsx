'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 1. First, mark the component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Only check auth AFTER mounting
  useEffect(() => {
    if (!mounted) return;

    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
        // Only redirect if we aren't already on login
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      localStorage.clear();
      if (pathname !== '/login') router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [mounted, pathname, router]);

  const login = (token: string, refreshToken: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/login');
  };

  // Prevent rendering children until we know the auth state
  // If we don't do this, protected pages will flash and redirect
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
