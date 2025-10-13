// @refresh reset
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { AuthState, LoginRequest, RegisterRequest } from '../services/auth.service';
import { ApiErrorHandler } from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Suscribirse a cambios de estado del servicio de autenticación
    const unsubscribe = authService.subscribe((newState) => {
      setAuthState(newState);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);
      await authService.login(credentials);
    } catch (err) {
      if (err instanceof ApiErrorHandler) {
        setError(err.message);
      } else {
        setError('Error inesperado durante el login');
      }
      throw err;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setError(null);
      await authService.register(userData);
    } catch (err) {
      if (err instanceof ApiErrorHandler) {
        setError(err.message);
      } else {
        setError('Error inesperado durante el registro');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
    } catch (err) {
      console.error('Error during logout:', err);
      // Aún así limpiar el estado local
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refreshToken = async () => {
    try {
      setError(null);
      await authService.refreshToken();
    } catch (err) {
      if (err instanceof ApiErrorHandler) {
        setError(err.message);
      } else {
        setError('Error al renovar el token');
      }
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
