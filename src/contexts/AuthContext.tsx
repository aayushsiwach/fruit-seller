import React, {  useContext, useState } from 'react';
import { 
  useSession, 
  signIn as nextAuthSignIn, 
  signOut as nextAuthSignOut 
} from 'next-auth/react';
interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

interface AuthUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
  role?: string;
  cart_id?: string;
}

interface AuthContextType {
  user: AuthUser | null | undefined;
  loading: boolean;
  error: string | null;
  register: (userData: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  register: async () => { throw new Error('register function not implemented'); },
  login: async () => { throw new Error('login function not implemented'); },
  logout: async () => { throw new Error('logout function not implemented'); },
  isAdmin: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const isAdmin = () => {
    if (session?.user.role) {
      return session.user.role === 'admin';
    }
    return false;
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      // Automatically log in after registration
      await login(userData.email, userData.password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError('An unknown error occurred');
        throw new Error('An unknown error occurred');
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await nextAuthSignIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      } 
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError('An unknown error occurred');
        throw new Error('An unknown error occurred');
      }
    }
  };

  const logout = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        throw error;
      } else {
        setError('An unknown error occurred');
        throw new Error('An unknown error occurred');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        loading: status === 'loading',
        error,
        register,
        login,
        logout,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);